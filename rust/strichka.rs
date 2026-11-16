use std::{env,fs,io::{self,BufRead,BufReader,Read,Write},os::unix::{fs::{FileTypeExt,PermissionsExt},net::{UnixListener,UnixStream}},path::Path,sync::{mpsc,Arc,Mutex},thread,time::Duration};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD,Engine};
use chrono::{DateTime,Utc};
use postgres::{Client,NoTls};
use serde::{Deserialize,Serialize};
use serde_json::{json,Value};
const PVS:&str=include_str!("visibility.sql");
const SOCKET:&str="/opt/mriya/backend/strichka/strichka.sock";
#[derive(Deserialize,Default)]
#[serde(deny_unknown_fields)]
struct Request{
#[serde(default)]
action:String,
#[serde(default)]
uid:i32,
#[serde(default)]
query:std::collections::HashMap<String,String>
}
#[derive(Deserialize,Serialize)]
#[serde(deny_unknown_fields)]
struct Cursor{version:u8,viewer:i32,target:i32,q:String,sort:String,id:i32,time:DateTime<Utc>,key:i64}
fn bad()->(u16,Value){(400,json!({"error":"невірні параметри стрічки..."}))}
fn connect(dsn:&str)->Result<Client,postgres::Error>{
let mut c=Client::connect(dsn,NoTls)?;
c.batch_execute("SET statement_timeout='12s';SET lock_timeout='3s';SET TIME ZONE 'UTC';SET default_transaction_read_only=on")?;
Ok(c)
}
fn feed(c:&mut Client,r:&Request)->Result<(u16,Value),postgres::Error>{
if r.action=="ping"{c.simple_query("SELECT 1")?;return Ok((200,json!({"ok":true,"service":"strichka","version":1})))}
if !r.action.is_empty()||r.uid<0{return Ok(bad())}
let get=|k:&str|r.query.get(k).map(String::as_str).unwrap_or("");
let target=if get("uid").is_empty(){0}else{match get("uid").parse::<i32>(){Ok(n) if n>0=>n,_=>return Ok(bad())}};
let paged=match get("page"){""|"0"=>false,"1"=>true,_=>return Ok(bad())};
let q=get("q").trim().to_string();
if q.chars().count()>200||q.contains('\0'){return Ok(bad())}
let sort=match get("sort"){""|"new"=>"new","old"=>"old","likes"=>"likes","dislikes"=>"dislikes","reposts"=>"reposts",_=>return Ok(bad())};
let limit=if paged{if get("limit").is_empty(){20}else{match get("limit").parse::<i64>(){Ok(n) if (1..=50).contains(&n)=>n,_=>return Ok(bad())}}}else{if !get("limit").is_empty()||!get("cursor").is_empty(){return Ok(bad())}0};
let cur=if get("cursor").is_empty(){None}else{
if !paged||get("cursor").len()>4096{return Ok(bad())}
let parsed=URL_SAFE_NO_PAD.decode(get("cursor")).ok().and_then(|b|serde_json::from_slice::<Cursor>(&b).ok());
match parsed{Some(v) if v.version==1&&v.viewer==r.uid&&v.target==target&&v.q==q&&v.sort==sort&&v.id>0&&v.key>=0=>Some(v),_=>return Ok(bad())}
};
let time=cur.as_ref().map(|v|v.time);
let id=cur.as_ref().map(|v|v.id);
let key=cur.as_ref().map(|v|v.key).unwrap_or(0);
let take=if paged{Some(limit+1)}else{None::<i64>};
let metric=match sort{"likes"=>Some("like"),"dislikes"=>Some("dislike"),"reposts"=>Some("repost"),_=>None};
let direction=if sort=="old"{"ASC"}else{"DESC"};
let op=if sort=="old"{">"}else{"<"};
let filter=format!("({PVS}) AND p.created_at IS NOT NULL AND ($2::int=0 OR p.avtor_id=$2) AND ($3::text='' OR strpos(lower(COALESCE(p.text,'')),lower($3))>0 OR strpos(lower(COALESCE(u.username,'')),lower($3))>0 OR strpos(lower(COALESCE(p.geo,'')),lower($3))>0)");
let page=if let Some(kind)=metric{
format!("WITH eligible AS NOT MATERIALIZED (SELECT p.*,(SELECT count(*) FROM public.post_acts z WHERE z.pid=p.id AND z.typ='{kind}') sk FROM public.posts p JOIN public.useri u ON u.id=p.avtor_id WHERE {filter}),page AS MATERIALIZED (SELECT p.* FROM eligible p WHERE ($5::int IS NULL OR (p.sk,p.id)<($6::bigint,$5)) AND ($4::timestamptz IS NULL OR TRUE) ORDER BY p.sk DESC,p.id DESC LIMIT $7::bigint)")
}else{
format!("WITH page AS MATERIALIZED (SELECT p.*,0::bigint sk FROM public.posts p JOIN public.useri u ON u.id=p.avtor_id WHERE {filter} AND ($5::int IS NULL OR (p.created_at,p.id){op}($4::timestamptz,$5)) AND ($6::bigint>=0) ORDER BY p.created_at {direction},p.id {direction} LIMIT $7::bigint)")
};
let order=if metric.is_some(){"p.sk DESC,p.id DESC".to_string()}else{format!("p.created_at {direction},p.id {direction}")};
let sql=page+&format!(r#"
SELECT jsonb_build_object(
'id',p.id,'avtor_id',p.avtor_id,'username',COALESCE(u.username,''),'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'text',COALESCE(p.text,''),'pics',COALESCE(p.pics,'{{}}'::text[]),'gif',COALESCE(p.gif,''),'vidimist',COALESCE(p.vidimist,'publichno'),'geo',COALESCE(p.geo,''),'created_at',p.created_at,'shared',COALESCE(p.shared,0),'viewz',COALESCE(p.viewz,0),'zredagovano',COALESCE(p.zredagovano,false),'zkoli',p.zkoli,
'laiki',a.likes,'dislaiki',a.dislikes,'reposts',a.reposts,'my_r',CASE WHEN a.my_like THEN 1 WHEN a.my_dislike THEN -1 ELSE 0 END,'my_rp',COALESCE(a.my_rp,false),'rp_u',COALESCE(a.names,'[]'::jsonb),'rp_users',COALESCE(a.people,'[]'::jsonb),'skilki_commentariv',COALESCE(p.skilki_commentariv,0),'misto',COALESCE(p.misto,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END
),p.created_at,p.id,p.sk
FROM page p JOIN public.useri u ON u.id=p.avtor_id LEFT JOIN public.galki g ON g.uid=u.id
LEFT JOIN LATERAL (
SELECT count(*) FILTER(WHERE z.typ='like') likes,count(*) FILTER(WHERE z.typ='dislike') dislikes,count(*) FILTER(WHERE z.typ='repost') reposts,
bool_or(z.uid=$1 AND z.typ='like') my_like,bool_or(z.uid=$1 AND z.typ='dislike') my_dislike,bool_or(z.uid=$1 AND z.typ='repost') my_rp,
jsonb_agg(u2.username ORDER BY u2.id) FILTER(WHERE z.typ='repost' AND u2.id IS NOT NULL) names,
jsonb_agg(jsonb_build_object('id',u2.id,'username',u2.username,'galka',CASE WHEN COALESCE(g2.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g2.pic,'label',COALESCE(g2.label,'')) END) ORDER BY u2.id) FILTER(WHERE z.typ='repost' AND u2.id IS NOT NULL) people
FROM public.post_acts z LEFT JOIN public.useri u2 ON u2.id=z.uid LEFT JOIN public.galki g2 ON g2.uid=u2.id WHERE z.pid=p.id
) a ON TRUE ORDER BY {order}
"#);
let rows=c.query(&sql,&[&r.uid,&target,&q,&time,&id,&key,&take])?;
let more=paged&&rows.len()>limit as usize;
let count=if paged{rows.len().min(limit as usize)}else{rows.len()};
let mut items=Vec::with_capacity(count);
let mut last=None;
for row in rows.iter().take(count){
let body:Value=row.get(0);
let time:DateTime<Utc>=row.get(1);
let id:i32=row.get(2);
let key:i64=row.get(3);
items.push(body);
last=Some(Cursor{version:1,viewer:r.uid,target,q:q.clone(),sort:sort.to_string(),id,time,key});
}
if !paged{return Ok((200,Value::Array(items)))}
let next=if more{last.map(|v|URL_SAFE_NO_PAD.encode(serde_json::to_vec(&v).expect("cursor")))}else{None};
Ok((200,json!({"items":items,"next":next})))
}
fn serve(mut stream:UnixStream,client:&mut Option<Client>,dsn:&str){
let _=stream.set_read_timeout(Some(Duration::from_secs(5)));
let _=stream.set_write_timeout(Some(Duration::from_secs(20)));
let mut line=String::new();
let read=BufReader::new((&stream).take(16385)).read_line(&mut line);
let response=if read.is_err()||line.len()>16384||!line.ends_with('\n'){bad()}else{
match serde_json::from_str::<Request>(&line){
Err(_)=>bad(),
Ok(r)=>{
if client.as_ref().map(|c|c.is_closed()).unwrap_or(true){*client=connect(dsn).ok()}
match client.as_mut(){
None=>(503,json!({"error":"стрічка тимчасово недоступна"})),
Some(c)=>match feed(c,&r){Ok(v)=>v,Err(e)=>{eprintln!("strichka query failed: {}",e.code().map(|v|v.code()).unwrap_or("CONNECTION"));*client=None;(503,json!({"error":"стрічка тимчасово недоступна"}))}}
}
}
}
};
let bytes=serde_json::to_vec(&json!({"status":response.0,"body":response.1}));
if let Ok(mut bytes)=bytes{bytes.push(b'\n');let _=stream.write_all(&bytes);}
}
fn run()->Result<(),Box<dyn std::error::Error>>{
let dsn_file=env::var("STRICHKA_DATABASE_FILE")?;
let dsn=fs::read_to_string(dsn_file)?.trim().to_string();
let socket=env::var("STRICHKA_SOCKET").unwrap_or_else(|_|SOCKET.to_string());
let check=connect(&dsn)?;
drop(check);
if let Ok(meta)=fs::symlink_metadata(&socket){
if !meta.file_type().is_socket(){return Err("socket path is not a socket".into())}
if UnixStream::connect(&socket).is_ok(){return Err("strichka is already running".into())}
fs::remove_file(&socket)?;
}
let listener=UnixListener::bind(Path::new(&socket))?;
fs::set_permissions(&socket,fs::Permissions::from_mode(0o600))?;
let (tx,rx)=mpsc::sync_channel::<UnixStream>(32);
let rx=Arc::new(Mutex::new(rx));
for _ in 0..4{
let rx=rx.clone();let dsn=dsn.clone();
thread::spawn(move||{let mut client=None;loop{
let stream={let guard=rx.lock().expect("queue");guard.recv()};
match stream{Ok(s)=>serve(s,&mut client,&dsn),Err(_)=>break}
}});
}
eprintln!("strichka ready");
for stream in listener.incoming(){match stream{
Ok(mut s)=>if let Err(mpsc::TrySendError::Full(_))=tx.try_send(s.try_clone()?){let _=s.set_write_timeout(Some(Duration::from_secs(1)));let _=s.write_all(b"{\"status\":503,\"body\":{\"error\":\"BUSY\"}}\n");},
Err(e) if e.kind()==io::ErrorKind::Interrupted=>continue,
Err(e)=>return Err(e.into())
}}
Ok(())
}
fn main(){if let Err(_)=run(){eprintln!("strichka startup failedddddd just check database configuration and socket permissions!!!");std::process::exit(1)}}
