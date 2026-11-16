package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
"html"
"regexp"
"sort"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
	"io"
	"math"
"math/big"
"net/mail"
	"mime"
	"mime/multipart"
	"net"
	"net/http"
	"net/smtp"
	"net/url"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"unicode/utf8"
)

var (
	db *pgxpool.Pool
	st = sessions.NewCookieStore([]byte(os.Getenv("MRIYA_SESSION_KEY")))
	RM = make(map[string]time.Time)
)

type Galka struct {
	Pic   string `json:"pic"`
	Label string `json:"label"`
}

type RepostUser struct {
	Id    int    `json:"id"`
	Un    string `json:"username"`
	Galka *Galka `json:"galka"`
}

func makeGalka(pic, label string) *Galka {
	if pic == "" {
		return nil
	}
	return &Galka{Pic: pic, Label: label}
}

type U struct {
	Pfx
	Id    int        `json:"id"`
	Un    string     `json:"username"`
	Ps    string     `json:"-"`
	Ph    string     `json:"photo"`
	Ra    time.Time  `json:"register_at"`
	Bi    string     `json:"birth"`
	Ge    string     `json:"gender"`
	Mi    string     `json:"misto"`
	Kr    string     `json:"kraina"`
	Ho    string     `json:"hobbies"`
	Mu    string     `json:"musica"`
	Ga    string     `json:"games"`
	Ot    string     `json:"other"`
	Ba    string     `json:"bannerok"`
	Bo    string     `json:"bio"`
	Pe    string     `json:"persite"`
	Tg    string     `json:"tg"`
	In    string     `json:"insta"`
	Xx    string     `json:"x"`
	Yt    string     `json:"youtube"`
	Gh    string     `json:"github"`
	Gl    string     `json:"gitlab"`
	Sp    string     `json:"spotify"`
	St    string     `json:"status"`
	Bg    string     `json:"bg"`
	Frame string     `json:"frame"`
	Music string     `json:"music"`
	La    *time.Time `json:"la"`
	Galka *Galka     `json:"galka"`
}

func main() {
if err:=asBoot();err!=nil{fmt.Fprintln(os.Stderr,err);os.Exit(1)}
	st.Options = &sessions.Options{Path: "/", MaxAge: 86400 * 30, HttpOnly: true}
	c, err := pgxpool.ParseConfig(os.Getenv("MRIYA_DSN"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "config: %v\n", err)
		os.Exit(1)
	}
	db, err = pgxpool.NewWithConfig(context.Background(), c)
	if err != nil {
		fmt.Fprintf(os.Stderr, "db: %v\n", err)
		os.Exit(1)
	}
	defer db.Close()
hsBootErr=hsRecover();if hsBootErr!=nil{fmt.Fprintln(os.Stderr,"hosting recovery:",hsBootErr)}
	if drCheck() {
		return
	}
	if syCheck() {
		return
	}
	initDB()
	if err := pfschema(); err != nil {
		fmt.Fprintln(os.Stderr, "profile migration:", err)
		os.Exit(1)
	}
	if _, err = db.Exec(context.Background(), "ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS misto TEXT NOT NULL DEFAULT ''"); err != nil {
		fmt.Fprintf(os.Stderr, "posts migration: %v\n", err)
		os.Exit(1)
	}

	r := chi.NewRouter()
r.Use(asSessionGuard)
	r.Use(traceMusicUpload)
	r.Use(middleware.Logger)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			s, _ := st.Get(r, "s")
			if uid, ok := s.Values["uid"].(int); ok {
				go db.Exec(context.Background(), "UPDATE useri SET la=NOW() WHERE id=$1 AND NOT EXISTS(SELECT 1 FROM public.native_settings ns WHERE ns.uid=useri.id AND ns.hidden)", uid)
			}
			next.ServeHTTP(w, r)
		})
	})
	r.Post("/api/reg", reg)
	r.Post("/api/ver", ver)
	r.Post("/api/login", logi)
r.Get("/api/auth/capabilities",asCapabilities)
r.HandleFunc("/api/account/security",asSettings)
r.Post("/api/auth/code",asVerify)
r.Post("/api/auth/resend",asResend)
	r.Post("/api/logout", logo)
	r.Get("/api/me", getMe)
r.HandleFunc("/api/account/native",nsHandle)
go nsLoop()
r.HandleFunc("/api/reports",rpHandle)
go rpLoop()
r.HandleFunc("/api/galki",igHandle)
	r.HandleFunc("/api/druzi/notifications", drNotifications)
	r.HandleFunc("/api/druzi/read", drRead)
	r.HandleFunc("/api/druzi/list", drFriends)
	r.HandleFunc("/api/druzi", drHandle)
	r.HandleFunc("/api/saity", syHandle)
	r.Get("/uploads/saity/{name}", syFile)
	r.Head("/uploads/saity/{name}", syFile)
	r.HandleFunc("/api/videos", vbh)
	r.Post("/api/videos/watch", vbwatch)
	r.Post("/api/videos/act", vbact)
	r.HandleFunc("/api/videos/comments", vbch)
	r.Get("/api/video-files/{name}", vbfile)
	r.Head("/api/video-files/{name}", vbfile)
	r.Get("/api/video-previews/{name}", vbfile)
	r.Head("/api/video-previews/{name}", vbfile)

	r.Get("/api/posts", getPs)
	r.Get("/api/posts/cities", pcm)
r.HandleFunc("/api/askmr",amrQuestions)
r.HandleFunc("/api/askmr/answers",amrAnswers)
r.HandleFunc("/api/askmr/manage",amrManage)
r.Get("/api/askmr/capabilities",amrCapabilities)
r.HandleFunc("/api/hosting",hsHandle)
r.Get("/api/hosting/file",hsFileHandle)
r.Get("/api/hosting/preview",hsPreview)
r.Get("/api/hosting/capabilities",hsCapabilities)
r.Get("/api/posts/features",mxFeatures)
	r.HandleFunc("/api/comments", cmh)
	r.HandleFunc("/api/pabliks", pbh)
r.HandleFunc("/api/pabliks/manage",pbmanage)
	r.HandleFunc("/api/pabliks/capabilities", pbcap)
	r.HandleFunc("/api/pabliks/suggestions", pbs)
	r.HandleFunc("/api/pabliks/members", pbu)
	r.HandleFunc("/api/pabliks/posts", pbt)
	r.HandleFunc("/api/pabliks/act", pba)
	r.Post("/api/posts", creP)
	r.Put("/api/posts", putP)
	r.Delete("/api/posts", delP)
	r.Post("/api/act", actP)
	r.HandleFunc("/api/user", handleU)
	r.Get("/api/users", getUsrs)
	r.Get("/api/frames", getFrames)
	r.Post("/api/upload", upl)
	r.Post("/api/profile-music", uploadProfileMusic)
	r.Get("/api/profile-music/{name}", serveProfileMusic)
	r.HandleFunc("/api/music", muh)
	r.HandleFunc("/api/music-upload", mbh)
	r.Get("/music-files/{name}", muf)
	r.Head("/music-files/{name}", muf)

	r.Get("/api/flash", getFl)
	r.Post("/api/flash", creFl)
	r.Post("/api/flash/act", actFl)

	r.Get("/api/noti", getNo)
	r.Post("/api/noti/rd", rdNo)
	r.Post("/api/noti/cl", clNo)

	fs := "./dist"
	r.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		p := filepath.Join(fs, r.URL.Path)
		if _, err := os.Stat(p); os.IsNotExist(err) {
			http.ServeFile(w, r, filepath.Join(fs, "index.html"))
			return
		}
		http.FileServer(http.Dir(fs)).ServeHTTP(w, r)
	})

	fmt.Println("запуск :8080")
	if err := mbinit(); err != nil {
		fmt.Fprintf(os.Stderr, "music staging: %v\n", err)
		os.Exit(1)
	}
	go mbgc()
	if err := vbinit(); err != nil {
		fmt.Fprintln(os.Stderr, "video initialization:", err)
		os.Exit(1)
	}
	if err := vcinit(); err != nil {
		fmt.Fprintln(os.Stderr, "video chunks:", err)
		os.Exit(1)
	}
	go vbwork()
	if err := http.ListenAndServe(":8080", r); err != nil {
		fmt.Fprintln(os.Stderr, "HTTP listen:", err)
		os.Exit(1)
	}
}

func initDB() {
	ctx := context.Background()
	queries := []string{
		`CREATE TABLE IF NOT EXISTS useri (
id SERIAL PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
poshta VARCHAR(100),
passw TEXT NOT NULL,
photo TEXT DEFAULT '',
register_at TIMESTAMPTZ DEFAULT NOW(),
birth TEXT DEFAULT '',
gender TEXT DEFAULT '',
misto TEXT DEFAULT '',
kraina TEXT DEFAULT '',
hobbies TEXT DEFAULT '',
musica TEXT DEFAULT '',
games TEXT DEFAULT '',
other TEXT DEFAULT '',
bannerok TEXT DEFAULT '',
bio TEXT DEFAULT '',
persite TEXT DEFAULT '',
tg TEXT DEFAULT '',
insta TEXT DEFAULT '',
x TEXT DEFAULT '',
youtube TEXT DEFAULT '',
github TEXT DEFAULT '',
gitlab TEXT DEFAULT '',
spotify TEXT DEFAULT '',
status TEXT DEFAULT '',
bg TEXT DEFAULT ''
);`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS bg TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS frame TEXT NOT NULL DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS music TEXT NOT NULL DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS status TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS bannerok TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS persite TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS tg TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS insta TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS x TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS youtube TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS github TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS gitlab TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS spotify TEXT DEFAULT '';`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS iv BOOLEAN DEFAULT FALSE;`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS vc TEXT;`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS vt TIMESTAMPTZ;`,
		`ALTER TABLE useri ADD COLUMN IF NOT EXISTS la TIMESTAMPTZ DEFAULT NOW();`,
		`UPDATE useri SET iv = TRUE WHERE (iv IS FALSE OR iv IS NULL) AND FALSE;`,
		`CREATE TABLE IF NOT EXISTS galki (
uid INTEGER PRIMARY KEY REFERENCES useri(id) ON DELETE CASCADE,
pic TEXT NOT NULL CHECK (btrim(pic) <> '' AND pic !~ '[/\\]'),
label TEXT NOT NULL DEFAULT ''
);`,
		`CREATE TABLE IF NOT EXISTS posts (
id SERIAL PRIMARY KEY,
avtor_id INT REFERENCES useri(id),
text TEXT DEFAULT '',
pics TEXT[] DEFAULT '{}',
gif TEXT DEFAULT '',
vidimist TEXT DEFAULT 'publichno',
geo TEXT DEFAULT '',
created_at TIMESTAMPTZ DEFAULT NOW(),
laiki INT DEFAULT 0,
dislaiki INT DEFAULT 0,
reposts INT DEFAULT 0,
shared INT DEFAULT 0,
viewz INT DEFAULT 0,
zredagovano BOOLEAN DEFAULT FALSE,
zkoli TIMESTAMPTZ
);`,
		`CREATE TABLE IF NOT EXISTS post_acts (
pid INT REFERENCES posts(id) ON DELETE CASCADE,
uid INT REFERENCES useri(id) ON DELETE CASCADE,
typ VARCHAR(10),
UNIQUE(pid, uid, typ)
);`,
		`CREATE TABLE IF NOT EXISTS flash (
id SERIAL PRIMARY KEY,
uid INT REFERENCES useri(id),
na TEXT NOT NULL,
fl TEXT NOT NULL,
ca TIMESTAMPTZ DEFAULT NOW(),
vw INT DEFAULT 0,
lk INT DEFAULT 0
);`,
		`CREATE TABLE IF NOT EXISTS flash_lk (
fid INT REFERENCES flash(id) ON DELETE CASCADE,
uid INT REFERENCES useri(id) ON DELETE CASCADE,
UNIQUE(fid, uid)
);`,
		`CREATE TABLE IF NOT EXISTS noti (
id SERIAL PRIMARY KEY,
uid INT REFERENCES useri(id) ON DELETE CASCADE,
actor_id INT REFERENCES useri(id) ON DELETE CASCADE,
pid INT,
typ VARCHAR(20),
rd BOOLEAN DEFAULT FALSE,
ca TIMESTAMPTZ DEFAULT NOW()
);`,
	}
	for _, q := range queries {
		_, _ = db.Exec(ctx, q)
	}
}

func sM(to,co string)error{return asSendMail(to,co,"registration")}
func asSendMail(to,co,purpose string)error{
if !asEmail(to){return fmt.Errorf("invalid recipient")}
	ad := os.Getenv("MRIYA_SMTP_HOST") + ":465"
	au := smtp.PlainAuth("", os.Getenv("MRIYA_SMTP_USER"), os.Getenv("MRIYA_SMTP_PASS"), os.Getenv("MRIYA_SMTP_HOST"))
	tl := &tls.Config{ServerName: "mail.oakwall.net"}
	d := &net.Dialer{Timeout: 5 * time.Second}
	cn, err := tls.DialWithDialer(d, "tcp", ad, tl)
	if err != nil {
		return err
	}
	defer cn.Close()
if err=cn.SetDeadline(time.Now().Add(8*time.Second));err!=nil{return err}
	c, err := smtp.NewClient(cn, "mail.oakwall.net")
	if err != nil {
		return err
	}
	defer c.Close()
	if err = c.Auth(au); err != nil {
		return err
	}
	if err = c.Mail("verify@mriya.ink"); err != nil {
		return err
	}
	if err = c.Rcpt(to); err != nil {
		return err
	}
	w, err := c.Data()
	if err != nil {
		return err
	}
subject,action:=asMailText(purpose)
msg:=fmt.Sprintf("From: verify@mriya.ink\r\nTo: %s\r\nSubject: =?UTF-8?B?%s?=\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nМрія: %s.\r\nВаш код: %s\r\n\r\nКод діє 5 хвилин і використовується один раз. Нікому його не повідомляйте. Якщо ви не запитували цю дію, не вводьте код.\r\n",to,base64.StdEncoding.EncodeToString([]byte(subject)),action,co)
	if _, err = w.Write([]byte(msg)); err != nil {
		return err
	}
	if err = w.Close(); err != nil {
		return err
	}
	return c.Quit()
}

func logi(w http.ResponseWriter, r *http.Request) {
if asLoginGate(w,r){return}
	w.Header().Set("Content-Type", "application/json")
	var d struct{ Login, Un, Passw, Ps string }
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		w.WriteHeader(400)
		return
	}
	un, pw := d.Login, d.Passw
	if un == "" {
		un = d.Un
	}
	if pw == "" {
		pw = d.Ps
	}

	var id int
	var hp string
	var iv bool
	err := db.QueryRow(context.Background(), "SELECT id, passw, COALESCE(iv, false) FROM useri WHERE LOWER(username)=LOWER($1) OR LOWER(poshta)=LOWER($1)", un).Scan(&id, &hp, &iv)

	if err != nil || bcrypt.CompareHashAndPassword([]byte(hp), []byte(pw)) != nil {
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(map[string]string{"error": "невірний логін або пароль"})
		return
	}
	if !iv {
		w.WriteHeader(403)
		json.NewEncoder(w).Encode(map[string]string{"error": "пошта не підтверджена"})
		return
	}

	go db.Exec(context.Background(), "UPDATE useri SET la=NOW() WHERE id=$1 AND NOT EXISTS(SELECT 1 FROM public.native_settings ns WHERE ns.uid=useri.id AND ns.hidden)", id)

	s, _ := st.Get(r, "s")
	s.Values["uid"] = id
	s.Save(r, w)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "id": id})
}

func rgRegistrationGate(w http.ResponseWriter,r *http.Request)bool{rgRegister(w,r);return true}
func rgVerificationGate(w http.ResponseWriter,r *http.Request)bool{rgVerify(w,r);return true}
func rgCodeMAC(token,code,un,mail,hash string)string{return asMAC(token+"\x00"+un+"\x00"+mail+"\x00"+hash,code,"registration")}
func rgRegister(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"POST"){return}
var d struct{Username,Un,Poshta,Passw,Ps,Gender,Photo,Ph string}
if err:=asRead(w,r,&d,false);err!=nil{asProblemOut(w,err);return}
un,pw,photo:=strings.TrimSpace(d.Username),d.Passw,d.Photo;if un==""{un=strings.TrimSpace(d.Un)};if pw==""{pw=d.Ps};if photo==""{photo=d.Ph};email:=strings.ToLower(strings.TrimSpace(d.Poshta))
if !utf8.ValidString(un)||un==""||utf8.RuneCountInString(un)>50||strings.ContainsAny(un,"@\x00\r\n\t")||!asEmail(email)||!utf8.ValidString(pw)||utf8.RuneCountInString(pw)<6||len(pw)>72{asProblemOut(w,&asProblem{400,"перевір ім’я, пошту та пароль: від 6 символів, до 72 байтів",0});return}
ctx,cancel:=context.WithTimeout(r.Context(),40*time.Second);defer cancel()
for _,limit:=range []struct{Key string;N,Seconds int}{{"reg-ip:"+asIP(r),30,3600},{"reg-email-minute:"+email,1,60},{"reg-email-hour:"+email,8,3600}}{if err:=asRate(ctx,limit.Key,limit.N,limit.Seconds);err!=nil{asProblemOut(w,err);return}}
token,code,err:=asRandom();if err!=nil{asProblemOut(w,err);return}
tx,err:=db.Begin(ctx);if err!=nil{asProblemOut(w,err);return};defer tx.Rollback(ctx)
if _,err=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(hashtextextended('reg-name:'||LOWER($1::text),0))",un);err!=nil{asProblemOut(w,err);return}
if _,err=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(hashtextextended('reg-email:'||LOWER($1::text),0))",email);err!=nil{asProblemOut(w,err);return}
var count int
if err=tx.QueryRow(ctx,"SELECT COUNT(*) FROM public.useri WHERE LOWER(username)=LOWER($1) OR LOWER(poshta)=LOWER($2)",un,email).Scan(&count);err!=nil{asProblemOut(w,err);return}
var id int;var hash string;registeredName,recipient:=un,email
if count==0{
hp,e:=bcrypt.GenerateFromPassword([]byte(pw),10);if e!=nil{asProblemOut(w,e);return};hash=string(hp)
err=tx.QueryRow(ctx,"INSERT INTO public.useri(username,poshta,passw,gender,photo,iv,vc,vt) VALUES($1,$2,$3,$4,$5,FALSE,NULL,NULL) RETURNING id",un,email,hash,d.Gender,photo).Scan(&id)
if err!=nil{var state interface{SQLState()string};if errors.As(err,&state)&&state.SQLState()=="23505"{asProblemOut(w,&asProblem{409,"користувач або пошта вже існує",0})}else{asProblemOut(w,err)};return}
}else if count==1{
var verified bool;var previous string
err=tx.QueryRow(ctx,"SELECT id,username,COALESCE(poshta,''),passw,COALESCE(iv,false),COALESCE(vc,'') FROM public.useri WHERE LOWER(username)=LOWER($1) OR LOWER(poshta)=LOWER($2) FOR UPDATE",un,email).Scan(&id,&registeredName,&recipient,&hash,&verified,&previous)
if err!=nil{asProblemOut(w,err);return}
if verified||!strings.EqualFold(registeredName,un)||!strings.EqualFold(recipient,email)||bcrypt.CompareHashAndPassword([]byte(hash),[]byte(pw))!=nil{asProblemOut(w,&asProblem{409,"користувач або пошта вже існує",0});return}
parts:=strings.Split(previous,":");if len(parts)==3&&parts[0]=="r1"&&asToken(parts[1]){for hmac.Equal([]byte(parts[2]),[]byte(rgCodeMAC(parts[1],code,registeredName,recipient,hash))){_,code,err=asRandom();if err!=nil{asProblemOut(w,err);return}}}
}else{asProblemOut(w,&asProblem{409,"користувач або пошта вже існує",0});return}
if err=asSendSlot(ctx,tx,id);err!=nil{asProblemOut(w,err);return}
stored:="r1:"+token+":"+rgCodeMAC(token,code,registeredName,recipient,hash)
if _,err=tx.Exec(ctx,"UPDATE public.useri SET vc=$2,vt=NOW() WHERE id=$1 AND COALESCE(iv,false)=false",id,stored);err!=nil{asProblemOut(w,err);return}
if err=asMailer(recipient,code,"registration");err!=nil{fmt.Fprintf(os.Stderr,"registration SMTP: %v\n",err);asProblemOut(w,&asProblem{503,"не вдалося надіслати лист, спробуй пізніше",60});return}
if err=tx.Commit(ctx);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"msg":"код відправлено на пошту"})
}
func rgVerify(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"POST"){return}
var d struct{Un,Vc string}
if err:=asRead(w,r,&d,false);err!=nil{asProblemOut(w,err);return}
un,code:=strings.TrimSpace(d.Un),strings.TrimSpace(d.Vc)
invalid:=func(){asProblemOut(w,&asProblem{400,"невірний код або термін дії минув",0})}
if un==""||utf8.RuneCountInString(un)>50||len(code)!=6||strings.IndexFunc(code,func(c rune)bool{return c<'0'||c>'9'})>=0{invalid();return}
ctx,cancel:=context.WithTimeout(r.Context(),15*time.Second);defer cancel()
if err:=asRate(ctx,"reg-verify-ip:"+asIP(r),120,600);err!=nil{asProblemOut(w,err);return}
var id int;var stored string
err:=db.QueryRow(ctx,"SELECT id,COALESCE(vc,'') FROM public.useri WHERE LOWER(username)=LOWER($1) AND COALESCE(iv,false)=false AND vt>NOW()-INTERVAL '5 minutes' ORDER BY id LIMIT 1",un).Scan(&id,&stored)
if errors.Is(err,pgx.ErrNoRows){invalid();return};if err!=nil{asProblemOut(w,err);return}
if stored==""{invalid();return}
if err=asRate(ctx,"reg-code:"+strconv.Itoa(id)+":"+stored,5,300);err!=nil{asProblemOut(w,err);return}
tx,err:=db.Begin(ctx);if err!=nil{asProblemOut(w,err);return};defer tx.Rollback(ctx)
var actual,name,email,hash string;var fresh bool
err=tx.QueryRow(ctx,"SELECT COALESCE(vc,''),username,COALESCE(poshta,''),passw,COALESCE(iv,false)=false AND vt>NOW()-INTERVAL '5 minutes' FROM public.useri WHERE id=$1 FOR UPDATE",id).Scan(&actual,&name,&email,&hash,&fresh)
if errors.Is(err,pgx.ErrNoRows){invalid();return};if err!=nil{asProblemOut(w,err);return};if !fresh||actual!=stored{invalid();return}
match:=false
if strings.HasPrefix(actual,"r1:"){parts:=strings.Split(actual,":");if len(parts)==3&&asToken(parts[1])&&len(parts[2])==64{match=hmac.Equal([]byte(parts[2]),[]byte(rgCodeMAC(parts[1],code,name,email,hash)))}}else if len(actual)==6{match=hmac.Equal([]byte(actual),[]byte(code))}
if !match{invalid();return}
if _,err=tx.Exec(ctx,"UPDATE public.useri SET iv=TRUE,vc=NULL,vt=NULL WHERE id=$1",id);err!=nil{asProblemOut(w,err);return}
if err=tx.Commit(ctx);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"msg":"пошта підтверджена"})
}

func reg(w http.ResponseWriter, r *http.Request) {
if rgRegistrationGate(w,r){return}
	w.Header().Set("Content-Type", "application/json")
	var d struct { Username, Un, Poshta, Passw, Ps, Gender, Photo, Ph string }
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil { w.WriteHeader(400); return }
	un, pw, ph := d.Username, d.Passw, d.Photo
	if un == "" { un = d.Un }
	if pw == "" { pw = d.Ps }
	if ph == "" { ph = d.Ph }
	po := strings.ToLower(strings.TrimSpace(d.Poshta))

	if un == "" || pw == "" || po == "" || !strings.Contains(po, "@") {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "заповніть всі поля"})
		return
	}
	if t, ok := RM[po]; ok && time.Since(t) < 60*time.Second {
		w.WriteHeader(429)
		json.NewEncoder(w).Encode(map[string]string{"error": "зачекайте хвилину перед новою спробою"})
		return
	}

	hp, _ := bcrypt.GenerateFromPassword([]byte(pw), 10)
	vc := fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)

	_, err := db.Exec(context.Background(), "DELETE FROM useri WHERE LOWER(username)=LOWER($1) AND iv=FALSE", un)
	_, err = db.Exec(context.Background(), "INSERT INTO useri (username, poshta, passw, gender, photo, iv, vc, vt) VALUES ($1, $2, $3, $4, $5, FALSE, $6, NOW())", un, po, string(hp), d.Gender, ph, vc)

	if err != nil {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "користувач або пошта вже існує"})
		return
	}

	RM[po] = time.Now()
	go func() {
		if err := sM(po, vc); err != nil {
			fmt.Printf("smtp err: %v\n", err)
		}
	}()

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "msg": "код відправлено на пошту"})
}
func ver(w http.ResponseWriter, r *http.Request) {
if rgVerificationGate(w,r){return}
	w.Header().Set("Content-Type", "application/json")
	var d struct{ Un, Vc string }
	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		w.WriteHeader(400)
		return
	}

	tag, err := db.Exec(context.Background(), "UPDATE useri SET iv=TRUE, vc=NULL, vt=NULL WHERE LOWER(username)=LOWER($1) AND vc=$2 AND vt > NOW() - INTERVAL '5 minutes'", d.Un, d.Vc)
	if err != nil || tag.RowsAffected() == 0 {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "невірний код або термін дії минув"})
		return
	}

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(map[string]interface{}{"ok": true, "msg": "пошта підтверджена"})
}

func logo(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	s.Options.MaxAge = -1
	s.Save(r, w)
	w.WriteHeader(200)
}

func getMe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(map[string]string{"error": "не ввійшов"})
		return
	}
	var u U
	var pfraw []byte
	var gp, gl string
	err := db.QueryRow(context.Background(), "SELECT u.id,u.username,COALESCE(u.photo,''),COALESCE(g.pic,''),COALESCE(g.label,''),COALESCE(u.frame,''),COALESCE(u.music,''),jsonb_build_object('ideology',COALESCE(u.ideology,''),'ideologies',COALESCE(u.ideologies,'[]'::jsonb),'religion',COALESCE(u.religion,''),'smoking',COALESCE(u.smoking,''),'alcohol',COALESCE(u.alcohol,''),'relationship',COALESCE(u.relationship,''),'mbti',COALESCE(u.mbti,''),'enneagram',COALESCE(u.enneagram,''),'enneawing',COALESCE(u.enneawing,''),'enneasubtype',COALESCE(u.enneasubtype,''),'instinct',COALESCE(u.instinct,''),'tritype',COALESCE(u.tritype,''),'phobias',COALESCE(u.phobias,'[]'::jsonb),'activity',COALESCE(u.activity,''),'films',COALESCE(u.films,''),'series',COALESCE(u.series,''),'books',COALESCE(u.books,''),'quotes',COALESCE(u.quotes,''),'school',COALESCE(u.school,''),'university',COALESCE(u.university,''),'work',COALESCE(u.work,''),'kicq',COALESCE(u.kicq,''),'openvk',COALESCE(u.openvk,''),'discord',COALESCE(u.discord,''),'steam',COALESCE(u.steam,''),'phone',COALESCE(u.phone,'')) FROM useri u LEFT JOIN galki g ON g.uid=u.id WHERE u.id=$1", uid).Scan(&u.Id, &u.Un, &u.Ph, &gp, &gl, &u.Frame, &u.Music, &pfraw)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	if err := json.Unmarshal(pfraw, &u.Pfx); err != nil {
		pferr(w, 500, "помилка читання профілю")
		return
	}
	if u.Ideologies == nil {
		u.Ideologies = []string{}
	}
	if u.Phobias == nil {
		u.Phobias = []string{}
	}
	u.Galka = makeGalka(gp, gl)
	json.NewEncoder(w).Encode(u)
}

type Pfx struct {
	Ideology     string   `json:"ideology"`
	Ideologies   []string `json:"ideologies"`
	Religion     string   `json:"religion"`
	Smoking      string   `json:"smoking"`
	Alcohol      string   `json:"alcohol"`
	Relationship string   `json:"relationship"`
	Mbti         string   `json:"mbti"`
	Enneagram    string   `json:"enneagram"`
	Enneawing    string   `json:"enneawing"`
	Enneasubtype string   `json:"enneasubtype"`
	Instinct     string   `json:"instinct"`
	Tritype      string   `json:"tritype"`
	Phobias      []string `json:"phobias"`
	Activity     string   `json:"activity"`
	Films        string   `json:"films"`
	Series       string   `json:"series"`
	Books        string   `json:"books"`
	Quotes       string   `json:"quotes"`
	School       string   `json:"school"`
	University   string   `json:"university"`
	Work         string   `json:"work"`
	Kicq         string   `json:"kicq"`
	Openvk       string   `json:"openvk"`
	Discord      string   `json:"discord"`
	Steam        string   `json:"steam"`
	Phone        string   `json:"phone"`
}

func pfschema() error {
	ctx, c := context.WithTimeout(context.Background(), 20*time.Second)
	defer c()
	tx, e := db.Begin(ctx)
	if e != nil {
		return e
	}
	defer tx.Rollback(context.Background())
	if _, e = tx.Exec(ctx, "SET LOCAL lock_timeout='5s'"); e != nil {
		return e
	}
	if _, e = tx.Exec(ctx, `ALTER TABLE public.useri ADD COLUMN IF NOT EXISTS ideology TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS ideologies JSONB NOT NULL DEFAULT '[]'::jsonb,ADD COLUMN IF NOT EXISTS religion TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS smoking TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS alcohol TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS relationship TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS mbti TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS enneagram TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS enneawing TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS enneasubtype TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS instinct TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS tritype TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS phobias JSONB NOT NULL DEFAULT '[]'::jsonb,ADD COLUMN IF NOT EXISTS activity TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS films TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS series TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS books TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS quotes TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS school TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS university TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS work TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS kicq TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS openvk TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS discord TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS steam TEXT NOT NULL DEFAULT '',ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT ''`); e != nil {
		return e
	}
	return tx.Commit(ctx)
}
func pferr(w http.ResponseWriter, n int, s string) {
	w.WriteHeader(n)
	json.NewEncoder(w).Encode(map[string]string{"error": s})
}
func pfstrings(p *Pfx) []struct {
	k string
	v *string
	n int
} {
	return []struct {
		k string
		v *string
		n int
	}{
		{"ideology", &p.Ideology, 120}, {"religion", &p.Religion, 120}, {"smoking", &p.Smoking, 120}, {"alcohol", &p.Alcohol, 120}, {"relationship", &p.Relationship, 120}, {"mbti", &p.Mbti, 16}, {"enneagram", &p.Enneagram, 1}, {"enneawing", &p.Enneawing, 3}, {"enneasubtype", &p.Enneasubtype, 3}, {"instinct", &p.Instinct, 5}, {"tritype", &p.Tritype, 8}, {"activity", &p.Activity, 2048}, {"films", &p.Films, 2048}, {"series", &p.Series, 2048}, {"books", &p.Books, 2048}, {"quotes", &p.Quotes, 2048}, {"school", &p.School, 255}, {"university", &p.University, 255}, {"work", &p.Work, 255}, {"kicq", &p.Kicq, 255}, {"openvk", &p.Openvk, 255}, {"discord", &p.Discord, 255}, {"steam", &p.Steam, 255}, {"phone", &p.Phone, 255}}
}
func pfone(v, list string) bool {
	if v == "" {
		return true
	}
	for _, s := range strings.Split(list, "|") {
		if s == v {
			return true
		}
	}
	return false
}
func pftri(v string) bool {
	if v == "" {
		return true
	}
	if len(v) < 3 {
		return false
	}
	n := len(v) - 3
	if n > 0 && !pfone(v[:n], "sp|so|sx|sp/so|sp/sx|so/sp|so/sx|sx/sp|sx/so") {
		return false
	}
	a := v[n:]
	seen := [3]bool{}
	for _, c := range a {
		j := -1
		switch c {
		case '2', '3', '4':
			j = 0
		case '5', '6', '7':
			j = 1
		case '8', '9', '1':
			j = 2
		}
		if j < 0 || seen[j] {
			return false
		}
		seen[j] = true
	}
	return seen[0] && seen[1] && seen[2]
}
func pfvalid(p *Pfx, m map[string]json.RawMessage) bool {
	for _, f := range pfstrings(p) {
		if b, ok := m[f.k]; ok {
			if bytes.Equal(bytes.TrimSpace(b), []byte("null")) || !utf8.ValidString(*f.v) || utf8.RuneCountInString(*f.v) > f.n || strings.IndexByte(*f.v, 0) >= 0 {
				return false
			}
		}
	}
	for _, f := range []struct {
		k string
		v *[]string
	}{{"ideologies", &p.Ideologies}, {"phobias", &p.Phobias}} {
		if b, ok := m[f.k]; ok {
			if len(bytes.TrimSpace(b)) == 0 || bytes.TrimSpace(b)[0] != '[' || len(*f.v) > 60 {
				return false
			}
			seen := map[string]bool{}
			for _, s := range *f.v {
				if !utf8.ValidString(s) || utf8.RuneCountInString(s) > 120 || strings.TrimSpace(s) == "" || strings.IndexByte(s, 0) >= 0 || seen[s] {
					return false
				}
				seen[s] = true
			}
			if *f.v == nil {
				*f.v = []string{}
			}
		}
	}
	if _, ok := m["mbti"]; ok && !pfone(p.Mbti, "INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP") {
		return false
	}
	if _, ok := m["enneagram"]; ok && !pfone(p.Enneagram, "1|2|3|4|5|6|7|8|9") {
		return false
	}
	if _, ok := m["enneawing"]; ok && !pfone(p.Enneawing, "1w9|1w2|2w1|2w3|3w2|3w4|4w3|4w5|5w4|5w6|6w5|6w7|7w6|7w8|8w7|8w9|9w8|9w1") {
		return false
	}
	if _, ok := m["instinct"]; ok && !pfone(p.Instinct, "sp|so|sx|sp/so|sp/sx|so/sp|so/sx|sx/sp|sx/so") {
		return false
	}
	if _, ok := m["enneasubtype"]; ok && p.Enneasubtype != "" {
		v := p.Enneasubtype
		if len(v) != 3 || !pfone(v[:2], "sp|so|sx") || v[2] < '1' || v[2] > '9' {
			return false
		}
	}
	if _, ok := m["tritype"]; ok && !pftri(p.Tritype) {
		return false
	}
	for _, k := range []string{"smoking", "alcohol"} {
		if _, ok := m[k]; ok {
			v := p.Smoking
			if k == "alcohol" {
				v = p.Alcohol
			}
			if !pfone(v, "Різко негативне|Негативне|Нейтральне|Позитивне|Різко позитивне") {
				return false
			}
		}
	}
	return true
}
func pfquery(u *U, m map[string]json.RawMessage, uid int) (string, []any) {
	s := "photo=$1,birth=$2,gender=$3,misto=$4,kraina=$5,hobbies=$6,musica=$7,games=$8,other=$9,bannerok=$10,bio=$11,persite=$12,tg=$13,insta=$14,x=$15,youtube=$16,github=$17,gitlab=$18,spotify=$19,status=$20,bg=$21,frame=$22,music=$23"
	a := []any{u.Ph, u.Bi, u.Ge, u.Mi, u.Kr, u.Ho, u.Mu, u.Ga, u.Ot, u.Ba, u.Bo, u.Pe, u.Tg, u.In, u.Xx, u.Yt, u.Gh, u.Gl, u.Sp, u.St, u.Bg, u.Frame, u.Music}
	for _, f := range pfstrings(&u.Pfx) {
		if _, ok := m[f.k]; ok {
			a = append(a, *f.v)
			s += "," + f.k + "=$" + strconv.Itoa(len(a))
		}
	}
	for _, f := range []struct {
		k string
		v []string
	}{{"ideologies", u.Ideologies}, {"phobias", u.Phobias}} {
		if _, ok := m[f.k]; ok {
			v := f.v
			if v == nil {
				v = []string{}
			}
			b, _ := json.Marshal(v)
			a = append(a, string(b))
			s += "," + f.k + "=$" + strconv.Itoa(len(a)) + "::jsonb"
		}
	}
	a = append(a, uid)
	return "UPDATE public.useri SET " + s + " WHERE id=$" + strconv.Itoa(len(a)), a
}

func handleU(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	s, _ := st.Get(r, "s")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == "GET" {
		id := r.URL.Query().Get("id")
		un := r.URL.Query().Get("un")
		q := `SELECT u.id,u.username,COALESCE(u.photo,''),u.register_at,COALESCE(u.birth::text,''),COALESCE(u.gender,''),COALESCE(u.misto,''),COALESCE(u.kraina,''),COALESCE(u.hobbies,''),COALESCE(u.musica,''),COALESCE(u.games,''),COALESCE(u.other,''),COALESCE(u.bannerok,''),COALESCE(u.bio,''),COALESCE(u.persite,''),COALESCE(u.tg,''),COALESCE(u.insta,''),COALESCE(u.x,''),COALESCE(u.youtube,''),COALESCE(u.github,''),COALESCE(u.gitlab,''),COALESCE(u.spotify,''),COALESCE(u.status,''),COALESCE(u.bg,''),CASE WHEN EXISTS(SELECT 1 FROM public.native_settings ns WHERE ns.uid=u.id AND ns.hidden) THEN NULL ELSE u.la END,COALESCE(g.pic,''),COALESCE(g.label,''),COALESCE(u.frame,''),COALESCE(u.music,''),jsonb_build_object('ideology',COALESCE(u.ideology,''),'ideologies',COALESCE(u.ideologies,'[]'::jsonb),'religion',COALESCE(u.religion,''),'smoking',COALESCE(u.smoking,''),'alcohol',COALESCE(u.alcohol,''),'relationship',COALESCE(u.relationship,''),'mbti',COALESCE(u.mbti,''),'enneagram',COALESCE(u.enneagram,''),'enneawing',COALESCE(u.enneawing,''),'enneasubtype',COALESCE(u.enneasubtype,''),'instinct',COALESCE(u.instinct,''),'tritype',COALESCE(u.tritype,''),'phobias',COALESCE(u.phobias,'[]'::jsonb),'activity',COALESCE(u.activity,''),'films',COALESCE(u.films,''),'series',COALESCE(u.series,''),'books',COALESCE(u.books,''),'quotes',COALESCE(u.quotes,''),'school',COALESCE(u.school,''),'university',COALESCE(u.university,''),'work',COALESCE(u.work,''),'kicq',COALESCE(u.kicq,''),'openvk',COALESCE(u.openvk,''),'discord',COALESCE(u.discord,''),'steam',COALESCE(u.steam,''),'phone',COALESCE(u.phone,'')) FROM useri u LEFT JOIN galki g ON g.uid=u.id WHERE `
		var row pgx.Row
		if id != "" {
			uidVal, err := strconv.Atoi(id)
			if err != nil {
				w.WriteHeader(404)
				json.NewEncoder(w).Encode(map[string]string{"error": "користувача не знайдено"})
				return
			}
			row = db.QueryRow(ctx, q+"u.id=$1", uidVal)
		} else if un != "" {
			row = db.QueryRow(ctx, q+"LOWER(u.username)=LOWER($1)", un)
		} else {
			uid, ok := s.Values["uid"].(int)
			if !ok {
				w.WriteHeader(401)
				json.NewEncoder(w).Encode(map[string]string{"error": "не ввійшов"})
				return
			}
			row = db.QueryRow(ctx, q+"u.id=$1", uid)
		}
		var u U
		var pfraw []byte
		var ra *time.Time
		var gp, gl string
		err := row.Scan(&u.Id, &u.Un, &u.Ph, &ra, &u.Bi, &u.Ge, &u.Mi, &u.Kr, &u.Ho, &u.Mu, &u.Ga, &u.Ot, &u.Ba, &u.Bo, &u.Pe, &u.Tg, &u.In, &u.Xx, &u.Yt, &u.Gh, &u.Gl, &u.Sp, &u.St, &u.Bg, &u.La, &gp, &gl, &u.Frame, &u.Music, &pfraw)
		if err != nil {
			w.WriteHeader(404)
			json.NewEncoder(w).Encode(map[string]string{"error": "користувача не знайдено"})
			return
		}
		if ra != nil {
			u.Ra = *ra
		} else {
			u.Ra = time.Now()
		}
		if err := json.Unmarshal(pfraw, &u.Pfx); err != nil {
			pferr(w, 500, "помилка читання профілю")
			return
		}
		if u.Ideologies == nil {
			u.Ideologies = []string{}
		}
		if u.Phobias == nil {
			u.Phobias = []string{}
		}
		u.Galka = makeGalka(gp, gl)
		json.NewEncoder(w).Encode(u)
	} else if r.Method == "PUT" {
		uid, ok := s.Values["uid"].(int)
		if !ok {
			w.WriteHeader(401)
			return
		}
		if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
			pferr(w, 403, "немає доступу")
			return
		}
		if origin := r.Header.Get("Origin"); origin != "" {
			o, e := url.Parse(origin)
			if e != nil || !(o.Scheme == "http" || o.Scheme == "https") || !strings.EqualFold(o.Host, r.Host) || o.User != nil || o.RawQuery != "" || o.Fragment != "" || o.Path != "" {
				pferr(w, 403, "немає доступу")
				return
			}
		}
		mt, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if e != nil || mt != "application/json" {
			pferr(w, 415, "невірні дані профілю")
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
		var u U
		var raw json.RawMessage
		var fields map[string]json.RawMessage
		dec := json.NewDecoder(r.Body)
		if err := dec.Decode(&raw); err != nil {
			var limit *http.MaxBytesError
			if errors.As(err, &limit) {
				pferr(w, 413, "завеликі дані профілю")
			} else {
				pferr(w, 400, "невірні дані профілю")
			}
			return
		}
		if len(raw) == 0 || raw[0] != '{' || dec.Decode(new(any)) != io.EOF || json.Unmarshal(raw, &fields) != nil || json.Unmarshal(raw, &u) != nil {
			pferr(w, 400, "невірні дані профілю")
			return
		}
		if !pfvalid(&u.Pfx, fields) {
			pferr(w, 400, "невірні дані профілю")
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()
		if !validFrame(u.Frame) {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]string{"error": "невірна рамка аватара"})
			return
		}
		if !validProfileMusic(u.Music, uid) {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]string{"error": "невірний музичний файл"})
			return
		}
		pq, pa := pfquery(&u, fields, uid)
		tag, err := db.Exec(ctx, pq, pa...)
		if err != nil {
			pferr(w, 500, "помилка збереження профілю")
			return
		}
		if tag.RowsAffected() != 1 {
			pferr(w, 404, "користувача не знайдено")
			return
		}
		w.WriteHeader(200)
	}
}

func fetchPost(ctx context.Context, pid int, reqUid int) (map[string]interface{}, error) {
	q := `SELECT p.id, p.avtor_id, COALESCE(u.username, ''), COALESCE(u.photo, ''), COALESCE(p.text, ''), COALESCE(p.pics, '{}'), COALESCE(p.gif, ''), COALESCE(p.vidimist, 'publichno'), COALESCE(p.geo, ''), p.created_at, COALESCE(p.shared, 0), COALESCE(p.viewz, 0), COALESCE(p.zredagovano, false), p.zkoli,
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='like'),
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='dislike'),
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='repost'),
COALESCE((SELECT typ FROM post_acts WHERE pid=p.id AND uid=$1 AND typ IN ('like','dislike') LIMIT 1), ''),
EXISTS(SELECT 1 FROM post_acts WHERE pid=p.id AND uid=$1 AND typ='repost'),
COALESCE(ARRAY(SELECT u2.username FROM post_acts pa JOIN useri u2 ON pa.uid=u2.id WHERE pa.pid=p.id AND pa.typ='repost')::TEXT[], '{}'::TEXT[]),
COALESCE(g.pic,''),COALESCE(g.label,''),
COALESCE((SELECT jsonb_agg(jsonb_build_object('id',u2.id,'username',u2.username,'galka',CASE WHEN COALESCE(g2.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g2.pic,'label',COALESCE(g2.label,'')) END) ORDER BY u2.id) FROM post_acts pa JOIN useri u2 ON pa.uid=u2.id LEFT JOIN galki g2 ON g2.uid=u2.id WHERE pa.pid=p.id AND pa.typ='repost'),'[]'::jsonb),COALESCE(p.skilki_commentariv,0),COALESCE(p.misto,''),(SELECT jsonb_build_object('id',mxu.id,'username',mxu.username,'photo',COALESCE(mxu.photo,'')) FROM public.useri mxu WHERE mxu.id=p.mx_coauthor_id)
FROM posts p JOIN useri u ON p.avtor_id=u.id LEFT JOIN galki g ON g.uid=u.id WHERE p.id=$2 AND ` + pvs
	var id, aid, sh, vw, laiki, dislaiki, reposts int
	var un, ph, tx, gf, vd, ge, myAct string
	var gp, gl string
	var pc, rpU []string
	var rpUsers []RepostUser
	var cn int
	var mi string
var mxCoauthor map[string]any
	var ct time.Time
	var zr, myRp bool
	var zk *time.Time
	err := db.QueryRow(ctx, q, reqUid, pid).Scan(&id, &aid, &un, &ph, &tx, &pc, &gf, &vd, &ge, &ct, &sh, &vw, &zr, &zk, &laiki, &dislaiki, &reposts, &myAct, &myRp, &rpU, &gp, &gl, &rpUsers, &cn, &mi, &mxCoauthor)
	if err != nil {
		return nil, err
	}
	myR := 0
	if myAct == "like" {
		myR = 1
	} else if myAct == "dislike" {
		myR = -1
	}
	return map[string]interface{}{
		"id": id, "avtor_id": aid, "username": un, "photo": ph, "text": tx,
		"pics": pc, "gif": gf, "vidimist": vd, "geo": ge, "created_at": ct,
		"shared": sh, "viewz": vw, "zredagovano": zr, "zkoli": zk,
		"laiki": laiki, "dislaiki": dislaiki, "reposts": reposts,
		"my_r": myR, "my_rp": myRp, "rp_u": rpU, "skilki_commentariv": cn,
		"galka": makeGalka(gp, gl), "rp_users": rpUsers, "misto": mi,"coauthor":mxCoauthor,
	}, nil
}

func getPs(w http.ResponseWriter, r *http.Request) {
	legacy := func() {
		q := r.URL.Query()
		if q.Get("page") != "1" && q.Get("q") == "" && q.Get("sort") == "" && q.Get("cursor") == "" && q.Get("limit") == "" {
			w.Header().Set("X-Mriya-Feed", "go-fallback")
			getPsLegacy(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(503)
		json.NewEncoder(w).Encode(map[string]string{"error": "стрічка тимчасово недоступна"})
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	s, err := st.Get(r, "s")
	uid := 0
	if err == nil {
		uid, _ = s.Values["uid"].(int)
	}
	if uid < 0 {
		uid = 0
	}
	q := map[string]string{}
	for _, k := range []string{"uid", "page", "limit", "cursor", "sort", "q"} {
		if v := r.URL.Query().Get(k); v != "" {
			q[k] = v
		}
	}
	conn, err := (&net.Dialer{}).DialContext(ctx, "unix", "/opt/mriya/backend/strichka/strichka.sock")
	if err != nil {
		legacy()
		return
	}
	defer conn.Close()
	stop := context.AfterFunc(ctx, func() { conn.Close() })
	defer stop()
	if deadline, ok := ctx.Deadline(); ok {
		conn.SetDeadline(deadline)
	}
	if err = json.NewEncoder(conn).Encode(map[string]interface{}{"uid": uid, "query": q}); err != nil {
		legacy()
		return
	}
	var out struct {
		Status int             `json:"status"`
		Body   json.RawMessage `json:"body"`
	}
	if err = json.NewDecoder(io.LimitReader(conn, 64<<20)).Decode(&out); err != nil || out.Status < 200 || out.Status > 599 || !json.Valid(out.Body) {
		legacy()
		return
	}
	if out.Status == 503 {
		legacy()
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Mriya-Feed", "rust")
	if out.Status==http.StatusOK{out.Body,err=mxFeed(ctx,out.Body);if err!=nil{pve(w,err);return}}
	w.WriteHeader(out.Status)
	w.Write(append(out.Body, '\n'))
}

func getPsLegacy(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	s, _ := st.Get(r, "s")
	reqUid, _ := s.Values["uid"].(int)
	uidStr := r.URL.Query().Get("uid")
	q := `SELECT p.id, p.avtor_id, COALESCE(u.username, ''), COALESCE(u.photo, ''), COALESCE(p.text, ''), COALESCE(p.pics, '{}'), COALESCE(p.gif, ''), COALESCE(p.vidimist, 'publichno'), COALESCE(p.geo, ''), p.created_at, COALESCE(p.shared, 0), COALESCE(p.viewz, 0), COALESCE(p.zredagovano, false), p.zkoli,
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='like'),
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='dislike'),
(SELECT COUNT(*) FROM post_acts WHERE pid=p.id AND typ='repost'),
COALESCE((SELECT typ FROM post_acts WHERE pid=p.id AND uid=$1 AND typ IN ('like','dislike') LIMIT 1), ''),
EXISTS(SELECT 1 FROM post_acts WHERE pid=p.id AND uid=$1 AND typ='repost'),
COALESCE(ARRAY(SELECT u2.username FROM post_acts pa JOIN useri u2 ON pa.uid=u2.id WHERE pa.pid=p.id AND pa.typ='repost')::TEXT[], '{}'::TEXT[]),
COALESCE(g.pic,''),COALESCE(g.label,''),
COALESCE((SELECT jsonb_agg(jsonb_build_object('id',u2.id,'username',u2.username,'galka',CASE WHEN COALESCE(g2.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g2.pic,'label',COALESCE(g2.label,'')) END) ORDER BY u2.id) FROM post_acts pa JOIN useri u2 ON pa.uid=u2.id LEFT JOIN galki g2 ON g2.uid=u2.id WHERE pa.pid=p.id AND pa.typ='repost'),'[]'::jsonb),COALESCE(p.skilki_commentariv,0),COALESCE(p.misto,''),(SELECT jsonb_build_object('id',mxu.id,'username',mxu.username,'photo',COALESCE(mxu.photo,'')) FROM public.useri mxu WHERE mxu.id=p.mx_coauthor_id)
FROM posts p JOIN useri u ON p.avtor_id=u.id LEFT JOIN galki g ON g.uid=u.id`
	q += ` WHERE ` + pvs
	var rows pgx.Rows
	var err error
	if uidStr != "" {
		targetUid, parseErr := strconv.Atoi(uidStr)
		if parseErr != nil {
			w.WriteHeader(400)
			return
		}
		rows, err = db.Query(ctx, q+` AND p.avtor_id = $2 ORDER BY p.created_at DESC`, reqUid, targetUid)
	} else {
		rows, err = db.Query(ctx, q+` ORDER BY p.created_at DESC`, reqUid)
	}
	if err != nil {
		w.WriteHeader(500)
		return
	}
	defer rows.Close()
	res := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id, aid, sh, vw, laiki, dislaiki, reposts int
		var un, ph, tx, gf, vd, ge, myAct string
		var gp, gl string
		var pc, rpU []string
		var rpUsers []RepostUser
		var cn int
		var mi string
var mxCoauthor map[string]any
		var ct time.Time
		var zr, myRp bool
		var zk *time.Time
		if err := rows.Scan(&id, &aid, &un, &ph, &tx, &pc, &gf, &vd, &ge, &ct, &sh, &vw, &zr, &zk, &laiki, &dislaiki, &reposts, &myAct, &myRp, &rpU, &gp, &gl, &rpUsers, &cn, &mi, &mxCoauthor); err == nil {
			myR := 0
			if myAct == "like" {
				myR = 1
			} else if myAct == "dislike" {
				myR = -1
			}
			res = append(res, map[string]interface{}{
				"id": id, "avtor_id": aid, "username": un, "photo": ph, "text": tx,
				"pics": pc, "gif": gf, "vidimist": vd, "geo": ge, "created_at": ct,
				"shared": sh, "viewz": vw, "zredagovano": zr, "zkoli": zk,
				"laiki": laiki, "dislaiki": dislaiki, "reposts": reposts,
				"my_r": myR, "my_rp": myRp, "rp_u": rpU, "skilki_commentariv": cn,
				"galka": makeGalka(gp, gl), "rp_users": rpUsers, "misto": mi,"coauthor":mxCoauthor,
			})
		}
	}
	json.NewEncoder(w).Encode(res)
}

func mxResolve(ctx context.Context,q Pq,name *string,uid int)(*int,error){
if name==nil{return nil,nil}
v:=strings.TrimPrefix(strings.TrimSpace(*name),"@");if v==""{return nil,nil}
if !utf8.ValidString(v)||utf8.RuneCountInString(v)>50||strings.ContainsAny(v,"\x00\r\n\t"){return nil,&Pe{400,"невірний юзернейм"}}
var id int
if err:=q.QueryRow(ctx,"SELECT id FROM public.useri WHERE lower(username)=lower($1) ORDER BY id LIMIT 1",v).Scan(&id);err!=nil{if errors.Is(err,pgx.ErrNoRows){return nil,&Pe{400,"користувача не знайдено"}};return nil,err}
if id==uid{return nil,&Pe{400,"обери іншого користувача"}}
return &id,nil
}
func mxFeed(ctx context.Context,body json.RawMessage)(json.RawMessage,error){
var envelope map[string]json.RawMessage
var items []map[string]json.RawMessage
array:=len(bytes.TrimSpace(body))>0&&bytes.TrimSpace(body)[0]=='['
if array{if err:=json.Unmarshal(body,&items);err!=nil{return nil,err}}else{if err:=json.Unmarshal(body,&envelope);err!=nil{return nil,err};raw,ok:=envelope["items"];if !ok{return body,nil};if err:=json.Unmarshal(raw,&items);err!=nil{return nil,err}}
if len(items)==0{return body,nil}
ids:=make([]int32,0,len(items));for _,p:=range items{var id int32;if err:=json.Unmarshal(p["id"],&id);err!=nil||id<=0{return nil,errors.New("invalid post id in feed")};ids=append(ids,id)}
rows,err:=db.Query(ctx,`SELECT p.id,jsonb_build_object('id',u.id,'username',u.username,'photo',COALESCE(u.photo,'')) FROM public.posts p JOIN public.useri u ON u.id=p.mx_coauthor_id WHERE p.id=ANY($1::int[])`,ids)
if err!=nil{return nil,err};defer rows.Close()
found:=map[int32]json.RawMessage{}
for rows.Next(){var id int32;var data []byte;if err=rows.Scan(&id,&data);err!=nil{return nil,err};found[id]=json.RawMessage(data)}
if err=rows.Err();err!=nil{return nil,err}
for _,p:=range items{var id int32;json.Unmarshal(p["id"],&id);data:=found[id];if len(data)==0{data=json.RawMessage("null")};p["coauthor"]=data}
if array{return json.Marshal(items)}
raw,err:=json.Marshal(items);if err!=nil{return nil,err};envelope["items"]=raw;return json.Marshal(envelope)
}
func mxFeatures(w http.ResponseWriter,r *http.Request){
w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");json.NewEncoder(w).Encode(map[string]any{"revision":"posting-20261109","coauthors":true})
}

func creP(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var p struct {
Coauthor *string `json:"coauthor_username"`
		Text     string   `json:"text"`
		Pics     []string `json:"pics"`
		Gif      string   `json:"gif"`
		Vidimist string   `json:"vidimist"`
		Geo      string   `json:"geo"`
		Misto    string   `json:"misto"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 128<<10)).Decode(&p); err != nil {
		cme(w, 400, "невірні дані запиту")
		return
	}
	if p.Vidimist == "" {
		p.Vidimist = "publichno"
	}
	if p.Pics == nil {
		p.Pics = []string{}
	}
	ctx := r.Context()
	if err := pvc(ctx, &p.Vidimist, &p.Misto); err != nil {
		pve(w, err)
		return
	}
	mxID,mxErr:=mxResolve(ctx,db,p.Coauthor,uid);if mxErr!=nil{pve(w,mxErr);return}
	var newID int
	err := db.QueryRow(ctx, "INSERT INTO posts (avtor_id, text, pics, gif, vidimist, geo, misto,mx_coauthor_id) VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING id", uid, p.Text, p.Pics, p.Gif, p.Vidimist, p.Geo, p.Misto,mxID).Scan(&newID)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	post, er := fetchPost(ctx, newID, uid)
	if er != nil {
		pve(w, er)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(post)
}

func putP(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var p struct {
Coauthor *string `json:"coauthor_username"`
		Id       int    `json:"id"`
		Text     string `json:"text"`
		Vidimist string `json:"vidimist"`
		Geo      string `json:"geo"`
		Misto    string `json:"misto"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 128<<10)).Decode(&p); err != nil {
		cme(w, 400, "невірні дані запиту")
		return
	}
	ctx := r.Context()
	if err := pvc(ctx, &p.Vidimist, &p.Misto); err != nil {
		pve(w, err)
		return
	}
	mxID,mxErr:=mxResolve(ctx,db,p.Coauthor,uid);if mxErr!=nil{pve(w,mxErr);return}
	ct, err := db.Exec(ctx, "UPDATE posts SET mx_coauthor_id=CASE WHEN $7 THEN $8::int ELSE mx_coauthor_id END,text=$1, vidimist=$2, geo=$3, misto=$6, zredagovano=true, zkoli=NOW() WHERE id=$4 AND avtor_id=$5", p.Text, p.Vidimist, p.Geo, p.Id, uid, p.Misto,p.Coauthor!=nil,mxID)
	if err != nil {
		pve(w, err)
		return
	}
	if ct.RowsAffected() == 0 {
		cme(w, 404, "допис не знайдено")
		return
	}
	post, er := fetchPost(ctx, p.Id, uid)
	if er != nil {
		pve(w, er)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	json.NewEncoder(w).Encode(post)
}

func delP(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(400)
		return
	}
	idStr := r.URL.Query().Get("id")
	pid, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	_, err = db.Exec(context.Background(), "DELETE FROM posts WHERE id=$1 AND (avtor_id=$2 OR EXISTS (SELECT 1 FROM public.galki WHERE uid=$2 AND label IN ('Модератор', 'Головний адміністратор')))", pid, uid)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}

func actP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var a struct {
		Id  int    `json:"id"`
		Act string `json:"act"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 8<<10)).Decode(&a); err != nil {
		cme(w, 400, "невірні дані запиту")
		return
	}
	if a.Id <= 0 || (a.Act != "like" && a.Act != "dislike" && a.Act != "repost" && a.Act != "view" && a.Act != "share") {
		cme(w, 400, "невірні дані запиту")
		return
	}
	ctx := r.Context()
	tr, be := db.Begin(ctx)
	if be != nil {
		pve(w, be)
		return
	}
	defer tr.Rollback(ctx)
	var va bool
	if be = tr.QueryRow(ctx, "SELECT "+pvs+" FROM public.posts p WHERE p.id=$2 FOR SHARE", uid, a.Id).Scan(&va); be != nil {
		pve(w, be)
		return
	}
	if !va {
		cme(w, 404, "допис не знайдено")
		return
	}
	if a.Act == "like" {
		tr.Exec(ctx, "DELETE FROM post_acts WHERE pid=$1 AND uid=$2 AND typ='dislike'", a.Id, uid)
		ct, _ := tr.Exec(ctx, "INSERT INTO post_acts (pid,uid,typ) VALUES ($1,$2,'like') ON CONFLICT DO NOTHING", a.Id, uid)
		if ct.RowsAffected() == 0 {
			tr.Exec(ctx, "DELETE FROM post_acts WHERE pid=$1 AND uid=$2 AND typ='like'", a.Id, uid)
		}
	} else if a.Act == "dislike" {
		tr.Exec(ctx, "DELETE FROM post_acts WHERE pid=$1 AND uid=$2 AND typ='like'", a.Id, uid)
		ct, _ := tr.Exec(ctx, "INSERT INTO post_acts (pid,uid,typ) VALUES ($1,$2,'dislike') ON CONFLICT DO NOTHING", a.Id, uid)
		if ct.RowsAffected() == 0 {
			tr.Exec(ctx, "DELETE FROM post_acts WHERE pid=$1 AND uid=$2 AND typ='dislike'", a.Id, uid)
		}
	} else if a.Act == "repost" {
		ct, _ := tr.Exec(ctx, "INSERT INTO post_acts (pid,uid,typ) VALUES ($1,$2,'repost') ON CONFLICT DO NOTHING", a.Id, uid)
		if ct.RowsAffected() == 0 {
			tr.Exec(ctx, "DELETE FROM post_acts WHERE pid=$1 AND uid=$2 AND typ='repost'", a.Id, uid)
		}
	} else if a.Act == "view" {
		tr.Exec(ctx, "UPDATE posts SET viewz = viewz + 1 WHERE id = $1", a.Id)
	} else if a.Act == "share" {
		tr.Exec(ctx, "UPDATE posts SET shared = shared + 1 WHERE id = $1", a.Id)
	}

	var aid int
	err := tr.QueryRow(ctx, "SELECT avtor_id FROM posts WHERE id=$1", a.Id).Scan(&aid)
	if err == nil && aid != 0 && aid != uid && a.Act != "view" {
		tr.Exec(ctx, "DELETE FROM noti WHERE uid=$1 AND actor_id=$2 AND pid=$3 AND typ=$4", aid, uid, a.Id, a.Act)
		var ex bool
		if a.Act == "share" {
			ex = true
		} else {
			_ = tr.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM post_acts WHERE pid=$1 AND uid=$2 AND typ=$3)", a.Id, uid, a.Act).Scan(&ex)
		}
		if ex {
			tr.Exec(ctx, "INSERT INTO noti (uid, actor_id, pid, typ) VALUES ($1, $2, $3, $4)", aid, uid, a.Id, a.Act)
		}
	}

	if be = tr.Commit(ctx); be != nil {
		pve(w, be)
		return
	}
	post, er := fetchPost(ctx, a.Id, uid)
	if er != nil {
		pve(w, er)
		return
	}
	json.NewEncoder(w).Encode(post)
}

func getFl(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	s, _ := st.Get(r, "s")
	reqUid, _ := s.Values["uid"].(int)
	q := `SELECT f.id,f.uid,COALESCE(u.username,''),COALESCE(u.photo,''),f.na,f.fl,f.ca,f.vw,f.lk,EXISTS(SELECT 1 FROM flash_lk WHERE fid=f.id AND uid=$1),COALESCE(g.pic,''),COALESCE(g.label,'') FROM flash f JOIN useri u ON f.uid=u.id LEFT JOIN galki g ON g.uid=u.id ORDER BY f.ca DESC`
	rows, err := db.Query(context.Background(), q, reqUid)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	defer rows.Close()
	res := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id, uid, vw, lk int
		var un, ph, na, fl string
		var gp, gl string
		var ca time.Time
		var isLk bool
		if err := rows.Scan(&id, &uid, &un, &ph, &na, &fl, &ca, &vw, &lk, &isLk, &gp, &gl); err == nil {
			res = append(res, map[string]interface{}{"id": id, "uid": uid, "username": un, "photo": ph, "na": na, "fl": fl, "ca": ca, "vw": vw, "lk": lk, "isLk": isLk, "galka": makeGalka(gp, gl)})
		}
	}
	json.NewEncoder(w).Encode(res)
}

func creFl(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var p struct{ Na, Fl string }
	json.NewDecoder(r.Body).Decode(&p)
	if p.Na == "" || p.Fl == "" {
		w.WriteHeader(400)
		return
	}
	db.Exec(context.Background(), "INSERT INTO flash (uid, na, fl) VALUES ($1, $2, $3)", uid, p.Na, p.Fl)
	w.WriteHeader(200)
}

func actFl(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		return
	}
	var a struct {
		Id  int    `json:"id"`
		Act string `json:"act"`
	}
	json.NewDecoder(r.Body).Decode(&a)
	ctx := context.Background()
	if a.Act == "view" {
		db.Exec(ctx, "UPDATE flash SET vw = vw + 1 WHERE id = $1", a.Id)
	} else if a.Act == "like" {
		ct, _ := db.Exec(ctx, "INSERT INTO flash_lk (fid,uid) VALUES ($1,$2) ON CONFLICT DO NOTHING", a.Id, uid)
		if ct.RowsAffected() == 0 {
			db.Exec(ctx, "DELETE FROM flash_lk WHERE fid=$1 AND uid=$2", a.Id, uid)
			db.Exec(ctx, "UPDATE flash SET lk = lk - 1 WHERE id = $1", a.Id)
		} else {
			db.Exec(ctx, "UPDATE flash SET lk = lk + 1 WHERE id = $1", a.Id)
		}
		var fuid int
		if err := db.QueryRow(ctx, "SELECT uid FROM flash WHERE id=$1", a.Id).Scan(&fuid); err == nil && fuid != 0 && fuid != uid {
			db.Exec(ctx, "DELETE FROM noti WHERE uid=$1 AND actor_id=$2 AND pid=$3 AND typ='fl_like'", fuid, uid, a.Id)
			var ex bool
			_ = db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM flash_lk WHERE fid=$1 AND uid=$2)", a.Id, uid).Scan(&ex)
			if ex {
				db.Exec(ctx, "INSERT INTO noti (uid, actor_id, pid, typ) VALUES ($1, $2, $3, 'fl_like')", fuid, uid, a.Id)
			}
		}
	}
	w.WriteHeader(200)
}

func upl(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("music") == "1" {
		uploadProfileMusic(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		var d struct {
			Name string `json:"name"`
			Data string `json:"data"`
		}
		if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
			w.WriteHeader(400)
			return
		}
		raw, err := base64.StdEncoding.DecodeString(d.Data)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		os.MkdirAll("./dist/uploads", 0755)
		ext := filepath.Ext(d.Name)
		if ext == "" || ext == ".bin" || ext == ".dat" {
			ext = ".swf"
		}
		base := strings.TrimSuffix(filepath.Base(d.Name), filepath.Ext(d.Name))
		fn := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), base, ext)
		os.WriteFile(filepath.Join("./dist/uploads", fn), raw, 0644)
		json.NewEncoder(w).Encode(map[string]string{"url": "/uploads/" + fn})
		return
	}
	f, h, err := r.FormFile("file")
	if err != nil {
		w.WriteHeader(400)
		return
	}
	defer f.Close()
	os.MkdirAll("./dist/uploads", 0755)
	fn := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(h.Filename))
	dst, _ := os.Create(filepath.Join("./dist/uploads", fn))
	defer dst.Close()
	io.Copy(dst, f)
	json.NewEncoder(w).Encode(map[string]string{"url": "/uploads/" + fn})
}

func getUsrs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := context.Background()
	ro, er := db.Query(ctx, "SELECT u.id,u.username,COALESCE(u.photo,''),COALESCE(u.status,''),u.register_at,COALESCE(u.gender,''),COALESCE(u.misto,''),COALESCE(u.kraina,''),COALESCE(u.bio,''),CASE WHEN EXISTS(SELECT 1 FROM public.native_settings ns WHERE ns.uid=u.id AND ns.hidden) THEN NULL ELSE u.la END,COALESCE(g.pic,''),COALESCE(g.label,''),jsonb_build_object('ideology',COALESCE(u.ideology,''),'ideologies',COALESCE(u.ideologies,'[]'::jsonb),'religion',COALESCE(u.religion,''),'smoking',COALESCE(u.smoking,''),'alcohol',COALESCE(u.alcohol,''),'relationship',COALESCE(u.relationship,''),'mbti',COALESCE(u.mbti,''),'enneagram',COALESCE(u.enneagram,''),'enneawing',COALESCE(u.enneawing,''),'enneasubtype',COALESCE(u.enneasubtype,''),'instinct',COALESCE(u.instinct,''),'tritype',COALESCE(u.tritype,''),'phobias',COALESCE(u.phobias,'[]'::jsonb),'activity',COALESCE(u.activity,''),'films',COALESCE(u.films,''),'series',COALESCE(u.series,''),'books',COALESCE(u.books,''),'quotes',COALESCE(u.quotes,''),'school',COALESCE(u.school,''),'university',COALESCE(u.university,''),'work',COALESCE(u.work,''),'kicq',COALESCE(u.kicq,''),'openvk',COALESCE(u.openvk,''),'discord',COALESCE(u.discord,''),'steam',COALESCE(u.steam,''),'phone',COALESCE(u.phone,''),'frame',COALESCE(u.frame,''),'games',COALESCE(u.games,'')) FROM useri u LEFT JOIN galki g ON g.uid=u.id ORDER BY CASE WHEN EXISTS(SELECT 1 FROM public.native_settings ns WHERE ns.uid=u.id AND ns.hidden) THEN NULL ELSE u.la END DESC NULLS LAST")
	if er != nil {
		w.WriteHeader(500)
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	defer ro.Close()
	type Us struct {
		Pfx
		Frame string `json:"frame"`
		Games string `json:"games"`
		Id    int    `json:"id"`
		Un    string `json:"un"`
		Ph    string `json:"ph"`
		St    string `json:"st"`
		Ra    string `json:"ra"`
		Ge    string `json:"ge"`
		Mi    string `json:"mi"`
		Kr    string `json:"kr"`
		Bo    string `json:"bo"`
		La    string `json:"la"`
		Galka *Galka `json:"galka"`
	}
	ul := make([]Us, 0)
	for ro.Next() {
		var id int
		var un, ph, st, ge, mi, kr, bo string
		var gp, gl string
		var ra, la *time.Time
		var raw []byte
		var ex struct {
			Pfx
			Frame string `json:"frame"`
			Games string `json:"games"`
		}
		if err := ro.Scan(&id, &un, &ph, &st, &ra, &ge, &mi, &kr, &bo, &la, &gp, &gl, &raw); err == nil {
			if e := json.Unmarshal(raw, &ex); e != nil {
				w.WriteHeader(500)
				json.NewEncoder(w).Encode([]interface{}{})
				return
			}
			if ex.Ideologies == nil {
				ex.Ideologies = []string{}
			}
			if ex.Phobias == nil {
				ex.Phobias = []string{}
			}
			var rt, lt string
			if ra != nil {
				rt = ra.Format(time.RFC3339)
			}
			if la != nil {
				lt = la.Format(time.RFC3339)
			}
			ul = append(ul, Us{Pfx: ex.Pfx, Frame: ex.Frame, Games: ex.Games, Id: id, Un: un, Ph: ph, St: st, Ra: rt, Ge: ge, Mi: mi, Kr: kr, Bo: bo, La: lt, Galka: makeGalka(gp, gl)})
		}
	}
	if ro.Err() != nil {
		w.WriteHeader(500)
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	json.NewEncoder(w).Encode(ul)
}

func getNo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	q := `SELECT n.id,n.typ,n.rd,n.ca,u.username,COALESCE(u.photo,''),n.pid,COALESCE(p.text,''),COALESCE(g.pic,''),COALESCE(g.label,'') FROM noti n JOIN useri u ON n.actor_id=u.id LEFT JOIN posts p ON n.pid=p.id LEFT JOIN galki g ON g.uid=u.id WHERE n.uid=$1 AND (n.pid IS NULL OR ` + pvs + `) ORDER BY n.ca DESC LIMIT 50`
	rows, err := db.Query(context.Background(), q, uid)
	if err != nil {
		w.WriteHeader(500)
		json.NewEncoder(w).Encode([]interface{}{})
		return
	}
	defer rows.Close()
	res := make([]map[string]interface{}, 0)
	for rows.Next() {
		var id int
		var pid *int
		var typ, un, ph, ptx string
		var gp, gl string
		var rd bool
		var ca time.Time
		if err := rows.Scan(&id, &typ, &rd, &ca, &un, &ph, &pid, &ptx, &gp, &gl); err == nil {
			if len([]rune(ptx)) > 50 {
				ptx = string([]rune(ptx)[:50]) + "..."
			}
			res = append(res, map[string]interface{}{"id": id, "typ": typ, "rd": rd, "ca": ca, "un": un, "ph": ph, "pid": pid, "ptx": ptx, "galka": makeGalka(gp, gl)})
		}
	}
	json.NewEncoder(w).Encode(res)
}

func rdNo(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	if uid, ok := s.Values["uid"].(int); ok {
		db.Exec(context.Background(), "UPDATE noti SET rd=TRUE WHERE uid=$1", uid)
	}
	w.WriteHeader(200)
}

func clNo(w http.ResponseWriter, r *http.Request) {
	s, _ := st.Get(r, "s")
	if uid, ok := s.Values["uid"].(int); ok {
		db.Exec(context.Background(), "DELETE FROM noti WHERE uid=$1", uid)
	}
	w.WriteHeader(200)
}

const avatarFramesDir = "/opt/mriya/frontend/public/frames"

func validFrame(name string) bool {
	if name == "" {
		return true
	}
	if name != filepath.Base(name) || strings.ContainsAny(name, "/\\") || !strings.HasSuffix(strings.ToLower(name), ".png") {
		return false
	}
	info, err := os.Lstat(filepath.Join(avatarFramesDir, name))
	return err == nil && info.Mode().IsRegular()
}

func getFrames(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	result := make([]string, 0)
	entries, err := os.ReadDir(avatarFramesDir)
	if err != nil {
		if os.IsNotExist(err) {
			json.NewEncoder(w).Encode(result)
			return
		}
		w.WriteHeader(500)
		json.NewEncoder(w).Encode(map[string]string{"error": "не вдалося прочитати рамки"})
		return
	}
	for _, entry := range entries {
		if !strings.HasSuffix(strings.ToLower(entry.Name()), ".png") {
			continue
		}
		info, err := entry.Info()
		if err != nil || !info.Mode().IsRegular() {
			continue
		}
		result = append(result, entry.Name())
	}
	json.NewEncoder(w).Encode(result)
}

const profileMusicDir = "/opt/mriya/backend/profile-music"
const profileMusicLimit int64 = 20 << 20

func profileMusicFile(name string) bool {
	if name == "" || name != filepath.Base(name) || strings.ContainsAny(name, "/\\") || !strings.HasSuffix(name, ".mp3") {
		return false
	}
	info, err := os.Lstat(filepath.Join(profileMusicDir, name))
	return err == nil && info.Mode().IsRegular()
}

func validProfileMusic(name string, uid int) bool {
	return name == "" || (strings.HasPrefix(name, strconv.Itoa(uid)+"_") && profileMusicFile(name))
}

func uploadProfileMusic(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	s, _ := st.Get(r, "s")
	uid, ok := s.Values["uid"].(int)
	if !ok {
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(map[string]string{"error": "не ввійшов"})
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 12<<20)
	var f io.ReadSeeker
	var filename string
	var size int64
	ct := strings.ToLower(r.Header.Get("Content-Type"))
	if strings.HasPrefix(ct, "application/json") {
		var d struct {
			Name string `json:"name"`
			Data string `json:"data"`
		}
		if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]string{"error": "поганий JSON"})
			return
		}
		raw, err := base64.StdEncoding.DecodeString(d.Data)
		if err != nil {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]string{"error": "поганий base64"})
			return
		}
		filename = d.Name
		size = int64(len(raw))
		f = bytes.NewReader(raw)
	} else {
		if err := r.ParseMultipartForm(12 << 20); err != nil {
			w.WriteHeader(413)
			json.NewEncoder(w).Encode(map[string]string{"error": "файл завеликий"})
			return
		}
		defer r.MultipartForm.RemoveAll()
		file, h, err := r.FormFile("file")
		if err != nil {
			w.WriteHeader(400)
			json.NewEncoder(w).Encode(map[string]string{"error": "немає файлу"})
			return
		}
		defer file.Close()
		f = file
		filename = h.Filename
		size = h.Size
	}
	if !strings.EqualFold(filepath.Ext(filename), ".mp3") || size <= 0 || size > 8<<20 {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "оберіть MP3 до 8 МБ"})
		return
	}
	head := make([]byte, 512)
	n, _ := f.Read(head)
	head = head[:n]
	isMP3 := http.DetectContentType(head) == "audio/mpeg" || (n >= 3 && string(head[:3]) == "ID3") || (n >= 4 && head[0] == 0xff && (head[1]&0xe0) == 0xe0)
	if !isMP3 {
		w.WriteHeader(400)
		json.NewEncoder(w).Encode(map[string]string{"error": "не MP3"})
		return
	}
	f.Seek(0, io.SeekStart)
	os.MkdirAll(profileMusicDir, 0755)
	dst, err := os.CreateTemp(profileMusicDir, strconv.Itoa(uid)+"_*.mp3")
	if err != nil {
		w.WriteHeader(500)
		return
	}
	name := filepath.Base(dst.Name())
	keep := false
	defer func() {
		dst.Close()
		if !keep {
			os.Remove(dst.Name())
		}
	}()
	written, err := io.Copy(dst, io.LimitReader(f, 8<<20+1))
	if err != nil || written == 0 || written > 8<<20 {
		w.WriteHeader(400)
		return
	}
	dst.Close()
	keep = true
	json.NewEncoder(w).Encode(map[string]string{"name": name})
}

func serveProfileMusic(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if !profileMusicFile(name) {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "audio/mpeg")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	http.ServeFile(w, r, filepath.Join(profileMusicDir, name))
}

type musicTraceBody struct {
	io.ReadCloser
	Count int64
}

func (b *musicTraceBody) Read(p []byte) (int, error) {
	n, err := b.ReadCloser.Read(p)
	b.Count += int64(n)
	if err != nil && err != io.EOF {
		fmt.Printf("[music] body-read-error bytes=%d err=%v\n", b.Count, err)
	}
	return n, err
}

func traceMusicUpload(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" || (r.URL.Path != "/api/upload" && r.URL.Path != "/api/profile-music") {
			next.ServeHTTP(w, r)
			return
		}
		started := time.Now()
		id := started.UnixNano()
		fmt.Printf("[music:%d] START path=%q query=%q length=%d type=%q remote=%q\n", id, r.URL.Path, r.URL.RawQuery, r.ContentLength, r.Header.Get("Content-Type"), r.RemoteAddr)
		body := &musicTraceBody{ReadCloser: r.Body}
		r.Body = body
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			status := ww.Status()
			if status == 0 {
				status = 200
			}
			fmt.Printf("[music:%d] END status=%d read=%d response=%d duration=%s context=%v\n", id, status, body.Count, ww.BytesWritten(), time.Since(started), r.Context().Err())
		}()
		next.ServeHTTP(ww, r)
	})
}

type Pq interface {
	QueryRow(context.Context, string, ...any) pgx.Row
	Query(context.Context, string, ...any) (pgx.Rows, error)
}

type Pe struct {
	St  int
	Msg string
}

func (e *Pe) Error() string { return e.Msg }

const pbq = `SELECT jsonb_build_object('id',c.id,'owner_id',c.owner_id,'owner_username',u.username,'name',c.name,'bio',c.bio,'photo',c.photo,'banner',c.banner,'max_members',c.max_members,'member_count',c.member_count,'posting',c.posting,'created_at',c.created_at,'updated_at',c.updated_at,'join_closed',COALESCE((SELECT x.join_closed FROM public.pablik_extras x WHERE x.cid=c.id),false),'welcome',COALESCE((SELECT x.welcome FROM public.pablik_extras x WHERE x.cid=c.id),''),'pinned_post_id',COALESCE((SELECT x.pinned_post_id FROM public.pablik_extras x WHERE x.cid=c.id),0),'rules',c.rules,'write_blocked',c.owner_id<>$1 AND EXISTS(SELECT 1 FROM public.pablik_write_blocks b WHERE b.cid=c.id AND b.uid=$1),'suggestions_count',CASE WHEN c.owner_id=$1 THEN (SELECT COUNT(*) FROM public.pablik_suggestions s WHERE s.cid=c.id AND s.status='pending') ELSE 0 END,'joined',EXISTS(SELECT 1 FROM public.pablik_members m WHERE m.cid=c.id AND m.uid=$1)) FROM public.pabliks c JOIN public.useri u ON u.id=c.owner_id `
const ppq = `SELECT jsonb_build_object('coauthor',(SELECT jsonb_build_object('id',mxu.id,'username',mxu.username,'photo',COALESCE(mxu.photo,'')) FROM public.useri mxu WHERE mxu.id=p.mx_coauthor_id),'id',p.id,'as_community',EXISTS(SELECT 1 FROM public.pablik_post_identity x WHERE x.pid=p.id),'community_name',(SELECT c.name FROM public.pabliks c WHERE c.id=p.cid),'community_photo',(SELECT c.photo FROM public.pabliks c WHERE c.id=p.cid),'pinned',EXISTS(SELECT 1 FROM public.pablik_extras x WHERE x.cid=p.cid AND x.pinned_post_id=p.id),'cid',p.cid,'avtor_id',p.avtor_id,'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END,'text',p.text,'pics',p.pics,'gif',p.gif,'geo',p.geo,'created_at',p.created_at,'zredagovano',p.zredagovano,'zkoli',p.zkoli,'laiki',(SELECT COUNT(*) FROM public.pablik_acts a WHERE a.pid=p.id AND a.typ='like'),'dislaiki',(SELECT COUNT(*) FROM public.pablik_acts a WHERE a.pid=p.id AND a.typ='dislike'),'reposts',(SELECT COUNT(*) FROM public.pablik_acts a WHERE a.pid=p.id AND a.typ='repost'),'shared',(SELECT COUNT(*) FROM public.pablik_acts a WHERE a.pid=p.id AND a.typ='share'),'viewz',(SELECT COUNT(*) FROM public.pablik_acts a WHERE a.pid=p.id AND a.typ='view'),'my_r',COALESCE((SELECT CASE WHEN a.typ='like' THEN 1 ELSE -1 END FROM public.pablik_acts a WHERE a.pid=p.id AND a.uid=$1 AND a.typ IN ('like','dislike')),0),'my_rp',EXISTS(SELECT 1 FROM public.pablik_acts a WHERE a.pid=p.id AND a.uid=$1 AND a.typ='repost'),'rp_users',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',v.id,'username',v.username,'galka',CASE WHEN COALESCE(k.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',k.pic,'label',COALESCE(k.label,'')) END) ORDER BY v.id) FROM public.pablik_acts a JOIN public.useri v ON v.id=a.uid LEFT JOIN public.galki k ON k.uid=v.id WHERE a.pid=p.id AND a.typ='repost'),'[]'::jsonb)) FROM public.pablik_posts p JOIN public.useri u ON u.id=p.avtor_id LEFT JOIN public.galki g ON g.uid=u.id `
const pmq = `SELECT jsonb_build_object('id',u.id,'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END,'joined_at',m.joined_at,'write_blocked',EXISTS(SELECT 1 FROM public.pablik_write_blocks b WHERE b.cid=m.cid AND b.uid=u.id)) FROM public.pablik_members m JOIN public.useri u ON u.id=m.uid LEFT JOIN public.galki g ON g.uid=u.id WHERE m.cid=$1 ORDER BY m.joined_at,u.id`

func pbj(w http.ResponseWriter, v any) { json.NewEncoder(w).Encode(v) }

func pbe(w http.ResponseWriter, err error) {
	var e *Pe
	if errors.As(err, &e) {
		w.WriteHeader(e.St)
		pbj(w, map[string]string{"error": e.Msg})
		return
	}
	if errors.Is(err, pgx.ErrNoRows) {
		w.WriteHeader(404)
		pbj(w, map[string]string{"error": "не знайдено"})
		return
	}
	fmt.Printf("pablik: %v\n", err)
	w.WriteHeader(500)
	pbj(w, map[string]string{"error": "помилка спільнот"})
}

func pbd(w http.ResponseWriter, r *http.Request, v any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(v); err != nil {
		return &Pe{400, "невірні дані запиту"}
	}
	var x any
	if err := d.Decode(&x); err != io.EOF {
		return &Pe{400, "невірні дані запиту"}
	}
	return nil
}

func pbi(v string) (int, error) {
	n, err := strconv.ParseInt(v, 10, 32)
	if err != nil || n <= 0 {
		return 0, &Pe{400, "невірний ідентифікатор"}
	}
	return int(n), nil
}

func pbv(v string, mx int) bool {
	return utf8.ValidString(v) && !strings.ContainsRune(v, 0) && utf8.RuneCountInString(v) <= mx
}

func pbf(v string, gf bool) bool {
	if v == "" {
		return true
	}
	u, err := url.Parse(v)
	if err != nil || u.IsAbs() || u.Host != "" || u.RawQuery != "" || u.Fragment != "" || u.Path != v || len(v) > 2048 || !strings.HasPrefix(v, "/uploads/") || len(v) <= 9 || strings.ContainsAny(v, "\\\x00\r\n") {
		return false
	}
	nm := v[9:]
	if nm != filepath.Base(nm) || strings.Contains(nm, "/") {
		return false
	}
	ext := strings.ToLower(filepath.Ext(nm))
	if gf {
		if ext != ".gif" {
			return false
		}
	} else if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		return false
	}
	fp := filepath.Join("dist", "uploads", nm)
	fi, err := os.Lstat(fp)
	if err != nil || !fi.Mode().IsRegular() || fi.Size() <= 0 || fi.Size() > 20<<20 {
		return false
	}
	f, err := os.Open(fp)
	if err != nil {
		return false
	}
	defer f.Close()
	hd := make([]byte, 512)
	n, err := f.Read(hd)
	if err != nil && err != io.EOF {
		return false
	}
	mt := http.DetectContentType(hd[:n])
	if gf {
		return mt == "image/gif"
	}
	return (ext == ".jpg" || ext == ".jpeg") && mt == "image/jpeg" || ext == ".png" && mt == "image/png" || ext == ".webp" && mt == "image/webp"
}

func pbl(ctx context.Context, q Pq, sql string, args ...any) ([]map[string]any, error) {
	rs, err := q.Query(ctx, sql, args...)
	if err != nil {
		return nil, err
	}
	defer rs.Close()
	ls := make([]map[string]any, 0)
	for rs.Next() {
		var v map[string]any
		if err = rs.Scan(&v); err != nil {
			return nil, err
		}
		ls = append(ls, v)
	}
	return ls, rs.Err()
}

func pbg(ctx context.Context, q Pq, id, uid int) (map[string]any, error) {
	var v map[string]any
	err := q.QueryRow(ctx, pbq+"WHERE c.id=$2", uid, id).Scan(&v)
	return v, err
}

func pbo(ctx context.Context, q Pq, id, uid int) (map[string]any, error) {
	var v map[string]any
	err := q.QueryRow(ctx, ppq+"WHERE p.id=$2", uid, id).Scan(&v)
	return v, err
}

func pbw(w http.ResponseWriter, r *http.Request, allow string) (context.Context, context.CancelFunc, int, bool) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	ctx, can := context.WithTimeout(r.Context(), 15*time.Second)
	if !strings.Contains(","+allow+",", ","+r.Method+",") {
		w.Header().Set("Allow", strings.ReplaceAll(allow, ",", ", "))
		pbe(w, &Pe{405, "метод не підтримується"})
		return ctx, can, 0, false
	}
	s, err := st.Get(r, "s")
	uid := 0
	if err == nil {
		uid, _ = s.Values["uid"].(int)
	}
	if r.Method != http.MethodGet {
		if uid <= 0 {
			pbe(w, &Pe{401, "увійди щоб взаємодіяти зі спільнотами"})
			return ctx, can, 0, false
		}
		if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
			pbe(w, &Pe{403, "запит з іншого сайту заборонено"})
			return ctx, can, 0, false
		}
		origin := r.Header.Get("Origin")
		ref := false
		if origin == "" {
			origin = r.Header.Get("Referer")
			ref = true
		}
		if origin != "" {
			u, e := url.Parse(origin)
			if e != nil || (u.Scheme != "https" && u.Scheme != "http") || !strings.EqualFold(u.Host, r.Host) || u.User != nil || (!ref && (u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/"))) {
				pbe(w, &Pe{403, "запит з іншого сайту заборонено"})
				return ctx, can, 0, false
			}
		}
		if r.Method == http.MethodPost || r.Method == http.MethodPut {
			mt, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if e != nil || mt != "application/json" {
				pbe(w, &Pe{415, "невірні дані запиту"})
				return ctx, can, 0, false
			}
		}
		var ex bool
		if err = db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)", uid).Scan(&ex); err != nil {
			pbe(w, err)
			return ctx, can, 0, false
		}
		if !ex {
			pbe(w, &Pe{401, "увійди знову"})
			return ctx, can, 0, false
		}
	}
	return ctx, can, uid, true
}

func pbh(w http.ResponseWriter, r *http.Request) {
	ctx, can, uid, ok := pbw(w, r, "GET,POST,PUT,DELETE")
	defer can()
	if !ok {
		return
	}
	if r.Method == http.MethodGet {
		if r.URL.Query().Get("id") == "" {
			ls, err := pbl(ctx, db, pbq+"ORDER BY c.created_at DESC,c.id DESC", uid)
			if err != nil {
				pbe(w, err)
				return
			}
			pbj(w, ls)
			return
		}
		id, err := pbi(r.URL.Query().Get("id"))
		if err != nil {
			pbe(w, err)
			return
		}
		g, err := pbg(ctx, db, id, uid)
		if err != nil {
			pbe(w, err)
			return
		}
		ps, err := pbl(ctx, db, ppq+"WHERE p.cid=$2 ORDER BY EXISTS(SELECT 1 FROM public.pablik_extras x WHERE x.cid=p.cid AND x.pinned_post_id=p.id) DESC,p.created_at DESC,p.id DESC", uid, id)
		if err != nil {
			pbe(w, err)
			return
		}
		pbj(w, map[string]any{"community": g, "posts": ps})
		return
	}
	var d struct {
		Id int     `json:"id"`
		Nm string  `json:"name"`
		Bo string  `json:"bio"`
		Ph string  `json:"photo"`
		Bn string  `json:"banner"`
		Mx int     `json:"max_members"`
		Pm string  `json:"posting"`
		Ru *string `json:"rules"`
Closed *bool `json:"join_closed"`
Welcome *string `json:"welcome"`
	}
	var err error
	if r.Method == http.MethodDelete {
		d.Id, err = pbi(r.URL.Query().Get("id"))
	} else {
		err = pbd(w, r, &d)
	}
	if err != nil {
		pbe(w, err)
		return
	}
	if r.Method != http.MethodPost && (d.Id <= 0 || d.Id > 2147483647) {
		pbe(w, &Pe{400, "невірна спільнота"})
		return
	}
	if r.Method != http.MethodDelete {
		d.Nm = strings.TrimSpace(d.Nm)
		if d.Nm == "" || !pbv(d.Nm, 100) || !pbv(d.Bo, 5000) || (d.Ru != nil && !pbv(*d.Ru, 5000)) || (d.Welcome != nil && !pbv(*d.Welcome,500)) || d.Mx < 1 || d.Mx > 2147483647 || !pbf(d.Ph, false) || !pbf(d.Bn, false) {
			pbe(w, &Pe{400, "невірні дані спільноти або зображення"})
			return
		}
		if r.Method == http.MethodPost {
			d.Pm = "owner"
		}
		if d.Pm != "owner" && d.Pm != "all" {
			pbe(w, &Pe{400, "невірне право публікації"})
			return
		}
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		pbe(w, err)
		return
	}
	defer tx.Rollback(ctx)
	if r.Method == http.MethodPost {
		err = tx.QueryRow(ctx, "INSERT INTO public.pabliks(owner_id,name,bio,photo,banner,max_members,posting,rules) VALUES($1,$2,$3,$4,$5,$6,'owner',COALESCE($7::text,'')) RETURNING id", uid, d.Nm, d.Bo, d.Ph, d.Bn, d.Mx, d.Ru).Scan(&d.Id)
	} else {
		var ow, ct int
		err = tx.QueryRow(ctx, "SELECT owner_id,member_count FROM public.pabliks WHERE id=$1 FOR UPDATE", d.Id).Scan(&ow, &ct)
		if err == nil && ow != uid {
			err = &Pe{403, "тільки власник може змінювати спільноту"}
		}
		if err == nil && r.Method == http.MethodPut && d.Mx < ct {
			err = &Pe{409, "ліміт менший за кількість учасників"}
		}
		if err == nil {
			if r.Method == http.MethodDelete {
				_, err = tx.Exec(ctx, "DELETE FROM public.pabliks WHERE id=$1", d.Id)
			} else {
				_, err = tx.Exec(ctx, "UPDATE public.pabliks SET name=$1,bio=$2,photo=$3,banner=$4,max_members=$5,posting=$6,rules=COALESCE($8::text,rules),updated_at=NOW() WHERE id=$7", d.Nm, d.Bo, d.Ph, d.Bn, d.Mx, d.Pm, d.Id, d.Ru)
			}
		}
	}
	if err != nil {
		pbe(w, err)
		return
	}
if r.Method!=http.MethodDelete&&(d.Closed!=nil||d.Welcome!=nil){
_,err=tx.Exec(ctx,"INSERT INTO public.pablik_extras(cid,join_closed,welcome) VALUES($1,COALESCE($2::boolean,false),COALESCE($3::text,'')) ON CONFLICT(cid) DO UPDATE SET join_closed=COALESCE($2::boolean,pablik_extras.join_closed),welcome=COALESCE($3::text,pablik_extras.welcome)",d.Id,d.Closed,d.Welcome)
if err!=nil{pbe(w,err);return}
}
	var v any = map[string]bool{"ok": true}
	if r.Method != http.MethodDelete {
		v, err = pbg(ctx, tx, d.Id, uid)
		if err != nil {
			pbe(w, err)
			return
		}
	}
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, v)
}

func pbu(w http.ResponseWriter, r *http.Request) {
	ctx, can, uid, ok := pbw(w, r, "GET,POST")
	defer can()
	if !ok {
		return
	}
	if r.Method == http.MethodGet {
		id, err := pbi(r.URL.Query().Get("cid"))
		if err != nil {
			pbe(w, err)
			return
		}
		if _, err = pbg(ctx, db, id, uid); err != nil {
			pbe(w, err)
			return
		}
		ls, err := pbl(ctx, db, pmq, id)
		if err != nil {
			pbe(w, err)
			return
		}
		pbj(w, ls)
		return
	}
	var d struct {
		Cid int    `json:"cid"`
		Uid int    `json:"uid"`
		Act string `json:"act"`
	}
	if err := pbd(w, r, &d); err != nil {
		pbe(w, err)
		return
	}
	if d.Cid <= 0 || d.Cid > 2147483647 || (d.Act != "join" && d.Act != "leave" && d.Act != "kick" && d.Act != "block" && d.Act != "unblock") {
		pbe(w, &Pe{400, "невірна дія спільноти"})
		return
	}
	moderating := d.Act == "kick" || d.Act == "block" || d.Act == "unblock"
	if (moderating && (d.Uid <= 0 || d.Uid > 2147483647)) || (!moderating && d.Uid != 0) {
		pbe(w, &Pe{400, "невірний ідентифікатор"})
		return
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		pbe(w, err)
		return
	}
	defer tx.Rollback(ctx)
	var ow, ct, mx int
	err = tx.QueryRow(ctx, "SELECT owner_id,member_count,max_members FROM public.pabliks WHERE id=$1 FOR UPDATE", d.Cid).Scan(&ow, &ct, &mx)
	if err != nil {
		pbe(w, err)
		return
	}
	if moderating {
		pbmoderate(w, ctx, tx, d.Cid, d.Uid, uid, ow, d.Act)
		return
	}
	var ex bool
	if err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=$1 AND uid=$2)", d.Cid, uid).Scan(&ex); err != nil {
		pbe(w, err)
		return
	}
	if d.Act == "leave" {
		if ow == uid {
			pbe(w, &Pe{403, "власник не може вийти зі спільноти"})
			return
		}
		_, err = tx.Exec(ctx, "DELETE FROM public.pablik_members WHERE cid=$1 AND uid=$2", d.Cid, uid)
	} else if !ex {
var closed bool
if err=tx.QueryRow(ctx,"SELECT COALESCE((SELECT join_closed FROM public.pablik_extras WHERE cid=$1),false)",d.Cid).Scan(&closed);err!=nil{pbe(w,err);return}
if closed{pbe(w,&Pe{409,"вступ тимчасово закрито"});return}
		if ct >= mx {
			pbe(w, &Pe{409, "у спільноті немає вільних місць"})
			return
		}
		_, err = tx.Exec(ctx, "INSERT INTO public.pablik_members(cid,uid) VALUES($1,$2) ON CONFLICT DO NOTHING", d.Cid, uid)
	}
	if err != nil {
		pbe(w, err)
		return
	}
	g, err := pbg(ctx, tx, d.Cid, uid)
	if err != nil {
		pbe(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, g)
}

func pbt(w http.ResponseWriter, r *http.Request) {
	ctx, can, uid, ok := pbw(w, r, "POST,PUT,DELETE")
	defer can()
	if !ok {
		return
	}
	var d struct {
Coauthor *string `json:"coauthor_username"`
		Id  int      `json:"id"`
		Cid int      `json:"cid"`
		Tx  string   `json:"text"`
		Pc  []string `json:"pics"`
		Gf  string   `json:"gif"`
		Ge  string   `json:"geo"`
As *bool `json:"as_community"`
	}
	var err error
	if r.Method == http.MethodDelete {
		d.Id, err = pbi(r.URL.Query().Get("id"))
	} else {
		err = pbd(w, r, &d)
	}
	if err != nil {
		pbe(w, err)
		return
	}
	if r.Method == http.MethodPost {
		if d.Cid <= 0 || d.Cid > 2147483647 {
			pbe(w, &Pe{400, "невірна спільнота"})
			return
		}
	} else if d.Id <= 0 || d.Id > 2147483647 {
		pbe(w, &Pe{400, "невірний допис"})
		return
	}
	if r.Method != http.MethodDelete {
		if !pbv(d.Tx, 5000) || !pbv(d.Ge, 100) || len(d.Pc) > 5 || (strings.TrimSpace(d.Tx) == "" && len(d.Pc) == 0 && d.Gf == "") || !pbf(d.Gf, true) {
			pbe(w, &Pe{400, "допис: до 5000 символів, 5 фото та один GIF"})
			return
		}
		for _, v := range d.Pc {
			if v == "" || !pbf(v, false) {
				pbe(w, &Pe{400, "невірне фото"})
				return
			}
		}
		if d.Pc == nil {
			d.Pc = []string{}
		}
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		pbe(w, err)
		return
	}
	defer tx.Rollback(ctx)
var mxID *int
if r.Method!=http.MethodDelete{mxID,err=mxResolve(ctx,tx,d.Coauthor,uid);if err!=nil{pbe(w,err);return}}
	if r.Method == http.MethodPost {
		var ow int
		var pm string
		var ex bool
		err = tx.QueryRow(ctx, "SELECT owner_id,posting FROM public.pabliks WHERE id=$1 FOR UPDATE", d.Cid).Scan(&ow, &pm)
		if err == nil {
			err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=$1 AND uid=$2)", d.Cid, uid).Scan(&ex)
		}
		if err == nil && ow != uid && (pm != "all" || !ex) {
			err = &Pe{403, "немає права публікувати"}
		}
if err==nil&&d.As!=nil&&*d.As&&ow!=uid{err=&Pe{403,"немає права публікувати"}}
		if err == nil {
			err = pbpermit(ctx, tx, d.Cid, uid)
		}
		if err == nil {
			err = tx.QueryRow(ctx, "INSERT INTO public.pablik_posts(cid,avtor_id,text,pics,gif,geo,mx_coauthor_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id", d.Cid, uid, d.Tx, d.Pc, d.Gf, d.Ge,mxID).Scan(&d.Id)
if err==nil&&d.As!=nil&&*d.As{_,err=tx.Exec(ctx,"INSERT INTO public.pablik_post_identity(pid) VALUES($1)",d.Id)}
		}
	} else {
		var au, ow int
		err = tx.QueryRow(ctx, "SELECT cid FROM public.pablik_posts WHERE id=$1", d.Id).Scan(&d.Cid)
		if err == nil {
			err = tx.QueryRow(ctx, "SELECT owner_id FROM public.pabliks WHERE id=$1 FOR UPDATE", d.Cid).Scan(&ow)
		}
		if err == nil {
			err = tx.QueryRow(ctx, "SELECT avtor_id FROM public.pablik_posts WHERE id=$1 AND cid=$2 FOR UPDATE", d.Id, d.Cid).Scan(&au)
		}
var asStored bool
if err==nil{err=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.pablik_post_identity WHERE pid=$1)",d.Id).Scan(&asStored)}
if err==nil&&d.As!=nil&&*d.As!=asStored{err=&Pe{400,"невірна дія допису"}}
		if err == nil && ((asStored&&ow!=uid)||(!asStored&&au != uid && (r.Method != http.MethodDelete || ow != uid))) {
			err = &Pe{403, "немає доступу до допису"}
		}
		if err == nil && r.Method == http.MethodPut {
			err = pbpermit(ctx, tx, d.Cid, uid)
		}
		if err == nil {
			if r.Method == http.MethodDelete {
				_, err = tx.Exec(ctx, "DELETE FROM public.pablik_posts WHERE id=$1", d.Id)
			} else {
				_, err = tx.Exec(ctx, "UPDATE public.pablik_posts SET mx_coauthor_id=CASE WHEN $6 THEN $7::int ELSE mx_coauthor_id END,text=$1,pics=$2,gif=$3,geo=$4 WHERE id=$5", d.Tx, d.Pc, d.Gf, d.Ge, d.Id,d.Coauthor!=nil,mxID)
			}
		}
	}
	if err != nil {
		pbe(w, err)
		return
	}
	var v any = map[string]bool{"ok": true}
	if r.Method != http.MethodDelete {
		v, err = pbo(ctx, tx, d.Id, uid)
		if err != nil {
			pbe(w, err)
			return
		}
	}
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, v)
}

func pba(w http.ResponseWriter, r *http.Request) {
	ctx, can, uid, ok := pbw(w, r, "POST")
	defer can()
	if !ok {
		return
	}
	var d struct {
		Id  int    `json:"id"`
		Act string `json:"act"`
	}
	if err := pbd(w, r, &d); err != nil {
		pbe(w, err)
		return
	}
	if d.Id <= 0 || d.Id > 2147483647 || (d.Act != "like" && d.Act != "dislike" && d.Act != "repost" && d.Act != "share" && d.Act != "view") {
		pbe(w, &Pe{400, "невірна дія допису"})
		return
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		pbe(w, err)
		return
	}
	defer tx.Rollback(ctx)
	var id int
	if err = tx.QueryRow(ctx, "SELECT id FROM public.pablik_posts WHERE id=$1 FOR UPDATE", d.Id).Scan(&id); err != nil {
		pbe(w, err)
		return
	}
	if d.Act == "like" || d.Act == "dislike" {
		var ac string
		err = tx.QueryRow(ctx, "SELECT typ FROM public.pablik_acts WHERE pid=$1 AND uid=$2 AND typ IN ('like','dislike')", d.Id, uid).Scan(&ac)
		if errors.Is(err, pgx.ErrNoRows) {
			err = nil
		}
		if err == nil {
			_, err = tx.Exec(ctx, "DELETE FROM public.pablik_acts WHERE pid=$1 AND uid=$2 AND typ IN ('like','dislike')", d.Id, uid)
		}
		if err == nil && ac != d.Act {
			_, err = tx.Exec(ctx, "INSERT INTO public.pablik_acts(pid,uid,typ) VALUES($1,$2,$3)", d.Id, uid, d.Act)
		}
	} else if d.Act == "repost" {
		var ex bool
		err = tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.pablik_acts WHERE pid=$1 AND uid=$2 AND typ='repost')", d.Id, uid).Scan(&ex)
		if err == nil {
			if ex {
				_, err = tx.Exec(ctx, "DELETE FROM public.pablik_acts WHERE pid=$1 AND uid=$2 AND typ='repost'", d.Id, uid)
			} else {
				_, err = tx.Exec(ctx, "INSERT INTO public.pablik_acts(pid,uid,typ) VALUES($1,$2,'repost')", d.Id, uid)
			}
		}
	} else {
		_, err = tx.Exec(ctx, "INSERT INTO public.pablik_acts(pid,uid,typ) VALUES($1,$2,$3) ON CONFLICT DO NOTHING", d.Id, uid, d.Act)
	}
	if err != nil {
		pbe(w, err)
		return
	}
	p, err := pbo(ctx, tx, d.Id, uid)
	if err != nil {
		pbe(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, p)
}

const pbsqV1 = `SELECT jsonb_build_object('coauthor',(SELECT jsonb_build_object('id',mxu.id,'username',mxu.username,'photo',COALESCE(mxu.photo,'')) FROM public.useri mxu WHERE mxu.id=s.mx_coauthor_id),'id',s.id,'cid',s.cid,'avtor_id',s.avtor_id,'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END,'text',s.text,'pics',s.pics,'gif',s.gif,'geo',s.geo,'created_at',s.created_at) FROM public.pablik_suggestions s JOIN public.useri u ON u.id=s.avtor_id LEFT JOIN public.galki g ON g.uid=u.id `

func pbcap(w http.ResponseWriter, r *http.Request) {
	ctx, can, _, ok := pbw(w, r, "GET")
	defer can()
	if !ok {
		return
	}
	var ready bool
	err := db.QueryRow(ctx, "SELECT to_regclass('public.pablik_suggestions') IS NOT NULL AND to_regclass('public.pablik_write_blocks') IS NOT NULL AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pabliks' AND column_name='rules')").Scan(&ready)
	if err != nil {
		pbe(w, err)
		return
	}
	if !ready {
		pbe(w, &Pe{503, "API спільнот ще не підключено"})
		return
	}
	pbj(w, map[string]any{"version": 1, "rules": true, "suggestions": true, "moderation": true,"extras":true})
}

func pbpermit(ctx context.Context, q Pq, cid, uid int) error {
	var ok bool
	err := q.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.pabliks c WHERE c.id=$1 AND (c.owner_id=$2 OR (EXISTS(SELECT 1 FROM public.pablik_members m WHERE m.cid=c.id AND m.uid=$2) AND NOT EXISTS(SELECT 1 FROM public.pablik_write_blocks b WHERE b.cid=c.id AND b.uid=$2))))", cid, uid).Scan(&ok)
	if err != nil {
		return err
	}
	if !ok {
		return &Pe{403, "немає права публікувати"}
	}
	return nil
}

func pbsv(text string, pics []string, gif, geo string) error {
	if !pbv(text, 5000) || !pbv(geo, 100) || len(pics) > 5 || (strings.TrimSpace(text) == "" && len(pics) == 0 && gif == "") || !pbf(gif, true) {
		return &Pe{400, "допис: до 5000 символів, 5 фото та один GIF"}
	}
	for _, v := range pics {
		if v == "" || !pbf(v, false) {
			return &Pe{400, "невірне фото"}
		}
	}
	return nil
}

func pbmoderate(w http.ResponseWriter, ctx context.Context, tx pgx.Tx, cid, target, uid, owner int, act string) {
	if owner != uid || target == owner {
		pbe(w, &Pe{403, "тільки власник може змінювати спільноту"})
		return
	}
	var exists bool
	if err := tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.pablik_members WHERE cid=$1 AND uid=$2)", cid, target).Scan(&exists); err != nil {
		pbe(w, err)
		return
	}
	if !exists {
		pbe(w, &Pe{404, "не знайдено"})
		return
	}
	var err error
	switch act {
	case "kick":
		_, err = tx.Exec(ctx, "DELETE FROM public.pablik_members WHERE cid=$1 AND uid=$2", cid, target)
	case "block":
		_, err = tx.Exec(ctx, "INSERT INTO public.pablik_write_blocks(cid,uid,blocked_by) VALUES($1,$2,$3) ON CONFLICT(cid,uid) DO UPDATE SET blocked_by=EXCLUDED.blocked_by,created_at=NOW()", cid, target, uid)
	case "unblock":
		_, err = tx.Exec(ctx, "DELETE FROM public.pablik_write_blocks WHERE cid=$1 AND uid=$2", cid, target)
	default:
		err = &Pe{400, "невірна дія спільноти"}
	}
	if err != nil {
		pbe(w, err)
		return
	}
	g, err := pbg(ctx, tx, cid, uid)
	if err != nil {
		pbe(w, err)
		return
	}
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, map[string]any{"ok": true, "uid": target, "community": g})
}

func pbs(w http.ResponseWriter, r *http.Request) {
	ctx, can, uid, ok := pbw(w, r, "GET,POST,PUT")
	defer can()
	if !ok {
		return
	}
	if uid <= 0 {
		pbe(w, &Pe{401, "увійди щоб взаємодіяти зі спільнотами"})
		return
	}
	if r.Method == http.MethodGet {
		cid, err := pbi(r.URL.Query().Get("cid"))
		if err != nil {
			pbe(w, err)
			return
		}
		tx, err := db.Begin(ctx)
		if err != nil {
			pbe(w, err)
			return
		}
		defer tx.Rollback(ctx)
		var owner int
		if err = tx.QueryRow(ctx, "SELECT owner_id FROM public.pabliks WHERE id=$1 FOR SHARE", cid).Scan(&owner); err != nil {
			pbe(w, err)
			return
		}
		if owner != uid {
			pbe(w, &Pe{403, "немає доступу до допису"})
			return
		}
		var pending int64
		if err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM public.pablik_suggestions WHERE cid=$1 AND status='pending'", cid).Scan(&pending); err != nil {
			pbe(w, err)
			return
		}
		out := map[string]any{"pending": pending}
		if r.URL.Query().Get("count") != "1" {
			items, e := pbl(ctx, tx, pbsqV1+"WHERE s.cid=$1 AND s.status='pending' ORDER BY s.created_at,s.id", cid)
			if e != nil {
				pbe(w, e)
				return
			}
			out["items"] = items
		}
		if err = tx.Commit(ctx); err != nil {
			pbe(w, err)
			return
		}
		pbj(w, out)
		return
	}
	if r.Method == http.MethodPost {
		var d struct {
Coauthor *string `json:"coauthor_username"`
			Cid int      `json:"cid"`
			Tx  string   `json:"text"`
			Pc  []string `json:"pics"`
			Gf  string   `json:"gif"`
			Ge  string   `json:"geo"`
		}
		if err := pbd(w, r, &d); err != nil {
			pbe(w, err)
			return
		}
		if d.Cid <= 0 || d.Cid > 2147483647 {
			pbe(w, &Pe{400, "невірна спільнота"})
			return
		}
		if err := pbsv(d.Tx, d.Pc, d.Gf, d.Ge); err != nil {
			pbe(w, err)
			return
		}
		if d.Pc == nil {
			d.Pc = []string{}
		}
		tx, err := db.Begin(ctx)
		if err != nil {
			pbe(w, err)
			return
		}
		defer tx.Rollback(ctx)
		mxID,mxErr:=mxResolve(ctx,tx,d.Coauthor,uid);if mxErr!=nil{pbe(w,mxErr);return}
		var owner, id int
		if err = tx.QueryRow(ctx, "SELECT owner_id FROM public.pabliks WHERE id=$1 FOR UPDATE", d.Cid).Scan(&owner); err != nil {
			pbe(w, err)
			return
		}
		if err = pbpermit(ctx, tx, d.Cid, uid); err != nil {
			pbe(w, err)
			return
		}
		if err = tx.QueryRow(ctx, "INSERT INTO public.pablik_suggestions(cid,avtor_id,text,pics,gif,geo,mx_coauthor_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id", d.Cid, uid, d.Tx, d.Pc, d.Gf, d.Ge,mxID).Scan(&id); err != nil {
			pbe(w, err)
			return
		}
		var item map[string]any
		if err = tx.QueryRow(ctx, pbsqV1+"WHERE s.id=$1", id).Scan(&item); err != nil {
			pbe(w, err)
			return
		}
		if err = tx.Commit(ctx); err != nil {
			pbe(w, err)
			return
		}
		w.WriteHeader(http.StatusCreated)
		pbj(w, item)
		return
	}
	var d struct {
		Id  int    `json:"id"`
		Act string `json:"act"`
	}
	if err := pbd(w, r, &d); err != nil {
		pbe(w, err)
		return
	}
	if d.Id <= 0 || d.Id > 2147483647 || (d.Act != "accept" && d.Act != "reject") {
		pbe(w, &Pe{400, "невірна дія допису"})
		return
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		pbe(w, err)
		return
	}
	defer tx.Rollback(ctx)
	var cid, owner, author int
	if err = tx.QueryRow(ctx, "SELECT cid FROM public.pablik_suggestions WHERE id=$1", d.Id).Scan(&cid); err != nil {
		pbe(w, err)
		return
	}
	if err = tx.QueryRow(ctx, "SELECT owner_id FROM public.pabliks WHERE id=$1 FOR UPDATE", cid).Scan(&owner); err != nil {
		pbe(w, err)
		return
	}
	if owner != uid {
		pbe(w, &Pe{403, "немає доступу до допису"})
		return
	}
	var status, text, gif, geo string
	var pics []string
	var postID *int
var mxCoauthorID *int
	err = tx.QueryRow(ctx, "SELECT avtor_id,text,pics,gif,geo,status,post_id,mx_coauthor_id FROM public.pablik_suggestions WHERE id=$1 AND cid=$2 FOR UPDATE", d.Id, cid).Scan(&author, &text, &pics, &gif, &geo, &status, &postID,&mxCoauthorID)
	if err != nil {
		pbe(w, err)
		return
	}
	if status == "pending" {
		next := "rejected"
		if d.Act == "accept" {
			if err = pbpermit(ctx, tx, cid, author); err != nil {
				pbe(w, err)
				return
			}
			if err = pbsv(text, pics, gif, geo); err != nil {
				pbe(w, err)
				return
			}
			if _, err = tx.Exec(ctx, "SELECT set_config('mriya.accepting_suggestion',$1,true)", strconv.Itoa(d.Id)); err != nil {
				pbe(w, err)
				return
			}
			var pid int
			if err = tx.QueryRow(ctx, "INSERT INTO public.pablik_posts(cid,avtor_id,text,pics,gif,geo,mx_coauthor_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id", cid, author, text, pics, gif, geo,mxCoauthorID).Scan(&pid); err != nil {
				pbe(w, err)
				return
			}
			postID = &pid
			next = "accepted"
		}
		if _, err = tx.Exec(ctx, "UPDATE public.pablik_suggestions SET status=$2,decided_by=$3,decided_at=NOW(),post_id=$4 WHERE id=$1", d.Id, next, uid, postID); err != nil {
			pbe(w, err)
			return
		}
	} else if (d.Act == "accept" && (status != "accepted" || postID == nil)) || (d.Act == "reject" && status != "rejected") {
		pbe(w, &Pe{409, "невірна дія допису"})
		return
	}
	out := map[string]any{"ok": true, "id": d.Id, "cid": cid}
	if d.Act == "accept" {
		p, err := pbo(ctx, tx, *postID, uid)
		if err != nil {
			pbe(w, err)
			return
		}
		out["post"] = p
	}
	var pending int64
	if err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM public.pablik_suggestions WHERE cid=$1 AND status='pending'", cid).Scan(&pending); err != nil {
		pbe(w, err)
		return
	}
	out["pending"] = pending
	if err = tx.Commit(ctx); err != nil {
		pbe(w, err)
		return
	}
	pbj(w, out)
}

type Cm struct {
	Id  int        `json:"id"`
	Pid int        `json:"pid"`
	Uid int        `json:"uid"`
	Rid *int       `json:"rid"`
	Un  string     `json:"username"`
	Ph  string     `json:"photo"`
	Fr  string     `json:"frame"`
	Gk  *Galka     `json:"galka"`
	Tx  string     `json:"text"`
	Pc  []string   `json:"pics"`
	Gf  string     `json:"gif"`
	Ge  string     `json:"geo"`
	Ca  time.Time  `json:"created_at"`
	Ua  *time.Time `json:"updated_at"`
	Del bool       `json:"deleted"`
}

type Cd struct {
	Id  int      `json:"id"`
	Pid int      `json:"pid"`
	Rid *int     `json:"rid"`
	Tx  string   `json:"text"`
	Pc  []string `json:"pics"`
	Gf  string   `json:"gif"`
	Ge  string   `json:"geo"`
}

const cmq = `SELECT c.id,c.pid,c.uid,c.rid,u.username,COALESCE(u.photo,''),COALESCE(u.frame,''),COALESCE(g.pic,''),COALESCE(g.label,''),c.text,c.pics,c.gif,c.geo,c.ca,c.ua,c.del FROM public.comments c JOIN public.useri u ON u.id=c.uid LEFT JOIN public.galki g ON g.uid=c.uid `

func cme(w http.ResponseWriter, st int, msg string) {
	w.WriteHeader(st)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func cms(row pgx.Row) (Cm, error) {
	var c Cm
	var gp, gl string
	err := row.Scan(&c.Id, &c.Pid, &c.Uid, &c.Rid, &c.Un, &c.Ph, &c.Fr, &gp, &gl, &c.Tx, &c.Pc, &c.Gf, &c.Ge, &c.Ca, &c.Ua, &c.Del)
	c.Gk = makeGalka(gp, gl)
	if c.Pc == nil {
		c.Pc = []string{}
	}
	return c, err
}

func cmv(d *Cd) bool {
	if !utf8.ValidString(d.Tx) || !utf8.ValidString(d.Ge) || strings.ContainsRune(d.Tx, 0) || strings.ContainsRune(d.Ge, 0) || utf8.RuneCountInString(d.Tx) > 5000 || utf8.RuneCountInString(d.Ge) > 100 || len(d.Pc) > 5 {
		return false
	}
	if strings.TrimSpace(d.Tx) == "" && len(d.Pc) == 0 && d.Gf == "" {
		return false
	}
	for _, v := range append(append([]string{}, d.Pc...), d.Gf) {
		if v == "" {
			continue
		}
		u, err := url.Parse(v)
		if err != nil || u.IsAbs() || u.Host != "" || u.RawQuery != "" || u.Fragment != "" || !strings.HasPrefix(u.Path, "/uploads/") || len(v) > 2048 || strings.ContainsAny(u.Path, "\\\x00\r\n") || strings.Contains(u.Path[9:], "/") || len(u.Path) <= 9 {
			return false
		}
	}
	for _, v := range d.Pc {
		if v == "" {
			return false
		}
	}
	if d.Pc == nil {
		d.Pc = []string{}
	}
	return true
}

func cma(ctx context.Context, pid, uid int) error {
	var ok bool
	err := db.QueryRow(ctx, "SELECT "+pvs+" FROM public.posts p WHERE p.id=$2", uid, pid).Scan(&ok)
	if err != nil {
		return err
	}
	if !ok {
		return pgx.ErrNoRows
	}
	return nil
}

func cmh(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	ctx, can := context.WithTimeout(r.Context(), 15*time.Second)
	defer can()
	s, _ := st.Get(r, "s")
	uid, _ := s.Values["uid"].(int)
	if r.Method == http.MethodGet {
		pid, err := strconv.Atoi(r.URL.Query().Get("pid"))
		if err != nil || pid <= 0 {
			cme(w, 400, "невірний допис")
			return
		}
		if err = cma(ctx, pid, uid); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				cme(w, 404, "допис не знайдено")
			} else {
				fmt.Printf("comments access: %v\n", err)
				cme(w, 500, "помилка читання допису")
			}
			return
		}
		po, err := fetchPost(ctx, pid, uid)
		if err != nil {
			fmt.Printf("comments post: %v\n", err)
			cme(w, 500, "помилка читання допису")
			return
		}
		rows, err := db.Query(ctx, cmq+"WHERE c.pid=$1 ORDER BY c.ca,c.id", pid)
		if err != nil {
			fmt.Printf("comments list: %v\n", err)
			cme(w, 500, "помилка завантаження коментарів")
			return
		}
		defer rows.Close()
		ls := make([]Cm, 0)
		for rows.Next() {
			c, err := cms(rows)
			if err != nil {
				fmt.Printf("comments scan: %v\n", err)
				cme(w, 500, "помилка завантаження коментарів")
				return
			}
			ls = append(ls, c)
		}
		if err = rows.Err(); err != nil {
			fmt.Printf("comments rows: %v\n", err)
			cme(w, 500, "помилка завантаження коментарів")
			return
		}
		cn := 0
		for _, c := range ls {
			if !c.Del {
				cn++
			}
		}
		po["skilki_commentariv"] = cn
		json.NewEncoder(w).Encode(map[string]interface{}{"post": po, "comments": ls, "count": cn})
		return
	}
	if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodDelete {
		w.Header().Set("Allow", "GET, POST, PUT, DELETE")
		cme(w, 405, "метод не підтримується")
		return
	}
	if uid <= 0 {
		cme(w, 401, "увійди щоб коментувати")
		return
	}
	var d Cd
	if r.Method == http.MethodDelete {
		id, err := strconv.Atoi(r.URL.Query().Get("id"))
		if err != nil || id <= 0 {
			cme(w, 400, "невірний коментар")
			return
		}
		d.Id = id
	} else {
		r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
		if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
			cme(w, 400, "невірні дані коментаря")
			return
		}
		if !cmv(&d) {
			cme(w, 400, "коментар: до 5000 символів, 5 фото та один GIF")
			return
		}
	}
	tx, err := db.Begin(ctx)
	if err != nil {
		fmt.Printf("comments begin: %v\n", err)
		cme(w, 500, "помилка збереження")
		return
	}
	defer tx.Rollback(ctx)
	pid := d.Pid
	if r.Method != http.MethodPost {
		if d.Id <= 0 {
			cme(w, 400, "невірний коментар")
			return
		}
		err = tx.QueryRow(ctx, "SELECT pid FROM public.comments WHERE id=$1 AND uid=$2 AND NOT del", d.Id, uid).Scan(&pid)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				cme(w, 404, "коментар не знайдено або немає доступу")
			} else {
				fmt.Printf("comments owner: %v\n", err)
				cme(w, 500, "помилка збереження")
			}
			return
		}
	}
	var vis string
	var aid int
	var va bool
	err = tx.QueryRow(ctx, "SELECT COALESCE(p.vidimist,'publichno'),p.avtor_id,"+pvs+" FROM public.posts p WHERE p.id=$2 FOR UPDATE", uid, pid).Scan(&vis, &aid, &va)
	if err != nil || !va {
		if err != nil && !errors.Is(err, pgx.ErrNoRows) {
			fmt.Printf("comments lock: %v\n", err)
			cme(w, 500, "помилка збереження")
		} else {
			cme(w, 404, "допис не знайдено")
		}
		return
	}
	var c Cm
	if r.Method == http.MethodPost {
		if d.Rid != nil {
			if *d.Rid <= 0 {
				cme(w, 400, "невірний батьківський коментар")
				return
			}
			var dep int
			err = tx.QueryRow(ctx, `WITH RECURSIVE tree AS (SELECT id,rid,1 AS depth FROM public.comments WHERE id=$1 AND pid=$2 UNION ALL SELECT c.id,c.rid,t.depth+1 FROM public.comments c JOIN tree t ON c.id=t.rid WHERE c.pid=$2 AND t.depth<13) SELECT COALESCE(MAX(depth),0) FROM tree`, *d.Rid, pid).Scan(&dep)
			if err != nil {
				fmt.Printf("comments parent: %v\n", err)
				cme(w, 500, "помилка збереження")
				return
			}
			if dep == 0 {
				cme(w, 400, "батьківський коментар не знайдено")
				return
			}
			if dep >= 12 {
				cme(w, 400, "максимум 12 рівнів відповідей")
				return
			}
		}
		err = tx.QueryRow(ctx, "INSERT INTO public.comments(pid,uid,rid,text,pics,gif,geo) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id", pid, uid, d.Rid, d.Tx, d.Pc, d.Gf, d.Ge).Scan(&d.Id)
	} else if r.Method == http.MethodPut {
		var id int
		err = tx.QueryRow(ctx, "UPDATE public.comments SET text=$1,pics=$2,gif=$3,geo=$4,ua=NOW() WHERE id=$5 AND uid=$6 AND NOT del RETURNING id", d.Tx, d.Pc, d.Gf, d.Ge, d.Id, uid).Scan(&id)
	} else {
		var id int
		err = tx.QueryRow(ctx, "UPDATE public.comments SET text='',pics='{}',gif='',geo='',del=TRUE,ua=NOW() WHERE id=$1 AND uid=$2 AND NOT del RETURNING id", d.Id, uid).Scan(&id)
	}
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			cme(w, 404, "коментар не знайдено або вже видалено")
		} else {
			fmt.Printf("comments write: %v\n", err)
			cme(w, 500, "помилка збереження коментаря")
		}
		return
	}
	c, err = cms(tx.QueryRow(ctx, cmq+"WHERE c.id=$1", d.Id))
	if err != nil {
		fmt.Printf("comments result: %v\n", err)
		cme(w, 500, "помилка читання коментаря")
		return
	}
	var cn int
	err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM public.comments WHERE pid=$1 AND NOT del", pid).Scan(&cn)
	if err != nil {
		fmt.Printf("comments count: %v\n", err)
		cme(w, 500, "помилка збереження")
		return
	}
	if err = tx.Commit(ctx); err != nil {
		fmt.Printf("comments commit: %v\n", err)
		cme(w, 500, "помилка збереження")
		return
	}
	if r.Method == http.MethodPost {
		w.WriteHeader(201)
	}
	json.NewEncoder(w).Encode(map[string]interface{}{"comment": c, "count": cn})
}

const pvs = `(($1>0 AND p.avtor_id=$1) OR COALESCE(p.vidimist,'publichno')='publichno' OR ($1>0 AND p.vidimist='misto' AND btrim(COALESCE(p.misto,''))<>'' AND EXISTS(SELECT 1 FROM public.useri v WHERE v.id=$1 AND lower(btrim(COALESCE(v.misto,'')))=lower(btrim(p.misto)))))`

func pvc(ctx context.Context, vd, mi *string) error {
	if *vd == "" {
		*vd = "publichno"
	}
	if *vd != "publichno" && *vd != "privatka" && *vd != "misto" {
		return &Pe{400, "невірна видимість допису"}
	}
	if *vd != "misto" {
		*mi = ""
		return nil
	}
	*mi = strings.TrimSpace(*mi)
	if *mi == "" {
		return &Pe{400, "обери місто для цього допису"}
	}
	if !utf8.ValidString(*mi) || utf8.RuneCountInString(*mi) > 100 || strings.ContainsRune(*mi, 0) {
		return &Pe{400, "місто не знайдено"}
	}
	var nm string
	err := db.QueryRow(ctx, "SELECT MIN(btrim(misto)) FROM public.useri WHERE lower(btrim(misto))=lower(btrim($1)) HAVING COUNT(*)>0", *mi).Scan(&nm)
	if errors.Is(err, pgx.ErrNoRows) {
		return &Pe{400, "місто не знайдено"}
	}
	if err != nil {
		return err
	}
	*mi = nm
	return nil
}

func pve(w http.ResponseWriter, err error) {
	var e *Pe
	if errors.As(err, &e) {
		cme(w, e.St, e.Msg)
		return
	}
	if errors.Is(err, pgx.ErrNoRows) {
		cme(w, 404, "допис не знайдено")
		return
	}
	fmt.Printf("posts: %v\n", err)
	cme(w, 500, "помилка збереження")
}

type amrBody struct{
Id int `json:"id"`
PytanniaID int `json:"pytannia_id"`
Nazva string `json:"nazva"`
Tekst string `json:"tekst"`
Fotky []string `json:"fotky"`
Vazhlyvist int `json:"vazhlyvist"`
Katehoriia string `json:"katehoriia"`
Hodyn *int `json:"hodyn"`
Maks int `json:"maks_vidpovidei"`
}
const amrClosed=`(q.zakryto OR (q.zavershennia IS NOT NULL AND q.zavershennia<=clock_timestamp()) OR (q.maks_vidpovidei>0 AND (SELECT count(*) FROM public.askmr_vidpovidi va WHERE va.pytannia_id=q.id)>=q.maks_vidpovidei))`
const amrAuthor=`'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END`
const amrQ=`SELECT jsonb_build_object('id',q.id,'avtor_id',q.avtor_id,'nazva',q.nazva,'tekst',q.tekst,'fotky',q.fotky,'vazhlyvist',q.vazhlyvist,'katehoriia',q.katehoriia,'stvoreno',q.stvoreno,'zmineno',q.zmineno,'zakryto',`+amrClosed+`,'zavershennia',q.zavershennia,'maks_vidpovidei',q.maks_vidpovidei,'kilkist_vidpovidei',(SELECT count(*) FROM public.askmr_vidpovidi v WHERE v.pytannia_id=q.id),'krashcha_vidpovid_id',COALESCE((SELECT k.vidpovid_id FROM public.askmr_krashchi k WHERE k.pytannia_id=q.id),0),`+amrAuthor+`) FROM public.askmr_pytannia q JOIN public.useri u ON u.id=q.avtor_id LEFT JOIN public.galki g ON g.uid=u.id `
const amrA=`SELECT jsonb_build_object('id',v.id,'pytannia_id',v.pytannia_id,'avtor_id',v.avtor_id,'tekst',v.tekst,'fotky',v.fotky,'stvoreno',v.stvoreno,'zmineno',v.zmineno,'krashcha',EXISTS(SELECT 1 FROM public.askmr_krashchi k WHERE k.pytannia_id=v.pytannia_id AND k.vidpovid_id=v.id),`+amrAuthor+`) FROM public.askmr_vidpovidi v JOIN public.useri u ON u.id=v.avtor_id LEFT JOIN public.galki g ON g.uid=u.id `
func amrCategory(v string)bool{switch v{case "tekhnolohii","muzyka","ihry","filmy","osvita","nauka","zdorovia","sport","podorozhi","pobut","kulinariia","tvorchist","stosunky","mriya","inshe":return true};return false}
func amrRead(w http.ResponseWriter,r *http.Request,v any)error{
d:=json.NewDecoder(http.MaxBytesReader(w,r.Body,256<<10));d.DisallowUnknownFields();if err:=d.Decode(v);err!=nil{return &Pe{400,"невірні дані запиту"}};var extra any;if d.Decode(&extra)!=io.EOF{return &Pe{400,"невірні дані запиту"}};return nil
}
func amrValid(d *amrBody,question bool)error{
limit:=10000;if question{limit=20000;if !pbv(d.Nazva,200)||strings.TrimSpace(d.Nazva)==""||!amrCategory(d.Katehoriia)||d.Vazhlyvist<0||d.Vazhlyvist>3||d.Maks<0||d.Maks>1000||d.Hodyn!=nil&&(*d.Hodyn<0||*d.Hodyn>8760){return &Pe{400,"невірні дані запиту"}}}
if !pbv(d.Tekst,limit)||len(d.Fotky)>5||(strings.TrimSpace(d.Tekst)==""&&len(d.Fotky)==0){return &Pe{400,"невірні дані запиту"}}
for _,p:=range d.Fotky{if p==""||!pbf(p,false){return &Pe{400,"невірне фото"}}};if d.Fotky==nil{d.Fotky=[]string{}};return nil
}
func amrPage(r *http.Request)(int,error){v:=r.URL.Query().Get("page");if v==""{return 1,nil};n,e:=strconv.Atoi(v);if e!=nil||n<1||n>10000{return 0,&Pe{400,"невірні дані запиту"}};return n,nil}
func amrGet(ctx context.Context,q Pq,id int)(map[string]any,error){var v map[string]any;err:=q.QueryRow(ctx,amrQ+"WHERE q.id=$1",id).Scan(&v);return v,err}
func amrRate(ctx context.Context,w http.ResponseWriter,uid int,kind string,n int)bool{if err:=asRate(ctx,"askmr:"+kind+":"+strconv.Itoa(uid),n,3600);err!=nil{asProblemOut(w,err);return false};return true}
func amrLock(ctx context.Context,tx pgx.Tx,id int)(int,error){var owner int;err:=tx.QueryRow(ctx,"SELECT avtor_id FROM public.askmr_pytannia WHERE id=$1 FOR UPDATE",id).Scan(&owner);return owner,err}
func amrCanDelete(ctx context.Context,tx pgx.Tx,owner,uid int)(bool,error){if owner==uid{return true,nil};var allowed bool;err:=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.galki WHERE uid=$1 AND label IN ('Модератор','Головний адміністратор'))",uid).Scan(&allowed);return allowed,err}
func amrCapabilities(w http.ResponseWriter,r *http.Request){w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");json.NewEncoder(w).Encode(map[string]any{"revision":"askmr-20261109","questions":true,"categories":15})}
func amrQuestions(w http.ResponseWriter,r *http.Request){
ctx,can,uid,ok:=pbw(w,r,"GET,POST,PUT,DELETE");defer can();if !ok{return}
if r.Method==http.MethodGet{
if r.URL.Query().Get("id")!=""{id,err:=pbi(r.URL.Query().Get("id"));if err!=nil{pbe(w,err);return};item,err:=amrGet(ctx,db,id);if err!=nil{pbe(w,err);return};pbj(w,item);return}
page,err:=amrPage(r);if err!=nil{pbe(w,err);return};text:=strings.TrimSpace(r.URL.Query().Get("q"));cat:=r.URL.Query().Get("katehoriia");state:=r.URL.Query().Get("stan");if !pbv(text,200)||(cat!=""&&!amrCategory(cat))||(state!=""&&state!="usi"&&state!="vidkryti"&&state!="zakryti"){pbe(w,&Pe{400,"невірні дані запиту"});return}
where:=`WHERE ($1='' OR strpos(lower(q.nazva||' '||q.tekst),lower($1))>0) AND ($2='' OR q.katehoriia=$2) AND ($3 IN ('','usi') OR ($3='vidkryti' AND NOT `+amrClosed+`) OR ($3='zakryti' AND `+amrClosed+`)) `
var count int;if err=db.QueryRow(ctx,"SELECT count(*) FROM public.askmr_pytannia q "+where,text,cat,state).Scan(&count);err!=nil{pbe(w,err);return}
items,err:=pbl(ctx,db,amrQ+where+"ORDER BY q.stvoreno DESC,q.id DESC LIMIT 20 OFFSET $4",text,cat,state,(page-1)*20);if err!=nil{pbe(w,err);return};pbj(w,map[string]any{"items":items,"total":count,"page":page,"more":page*20<count});return
}
var d amrBody;var err error;if r.Method==http.MethodDelete{d.Id,err=pbi(r.URL.Query().Get("id"))}else{err=amrRead(w,r,&d)};if err!=nil{pbe(w,err);return};if r.Method!=http.MethodPost&&(d.Id<=0||d.Id>2147483647){pbe(w,&Pe{400,"невірні дані запиту"});return}
if r.Method!=http.MethodDelete{if err=amrValid(&d,true);err!=nil{pbe(w,err);return}}
if r.Method==http.MethodPost&&!amrRate(ctx,w,uid,"pytannia",20){return}
tx,err:=db.Begin(ctx);if err!=nil{pbe(w,err);return};defer tx.Rollback(ctx)
if r.Method==http.MethodPost{
hours:=0;if d.Hodyn!=nil{hours=*d.Hodyn};err=tx.QueryRow(ctx,"INSERT INTO public.askmr_pytannia(avtor_id,nazva,tekst,fotky,vazhlyvist,katehoriia,zavershennia,maks_vidpovidei) VALUES($1,$2,$3,$4,$5,$6,CASE WHEN $7::int=0 THEN NULL ELSE clock_timestamp()+$7::int*INTERVAL '1 hour' END,$8) RETURNING id",uid,strings.TrimSpace(d.Nazva),d.Tekst,d.Fotky,d.Vazhlyvist,d.Katehoriia,hours,d.Maks).Scan(&d.Id)
}else{
owner,e:=amrLock(ctx,tx,d.Id);if e!=nil{pbe(w,e);return};if r.Method==http.MethodDelete{allowed,e:=amrCanDelete(ctx,tx,owner,uid);if e!=nil{pbe(w,e);return};if !allowed{pbe(w,&Pe{403,"немає доступу"});return};_,err=tx.Exec(ctx,"DELETE FROM public.askmr_pytannia WHERE id=$1",d.Id)}else{
if owner!=uid{pbe(w,&Pe{403,"немає доступу"});return};hours:=0;if d.Hodyn!=nil{hours=*d.Hodyn};_,err=tx.Exec(ctx,"UPDATE public.askmr_pytannia SET nazva=$2,tekst=$3,fotky=$4,vazhlyvist=$5,katehoriia=$6,maks_vidpovidei=$7,zavershennia=CASE WHEN NOT $8::boolean THEN zavershennia WHEN $9::int=0 THEN NULL ELSE clock_timestamp()+$9::int*INTERVAL '1 hour' END,zmineno=clock_timestamp() WHERE id=$1",d.Id,strings.TrimSpace(d.Nazva),d.Tekst,d.Fotky,d.Vazhlyvist,d.Katehoriia,d.Maks,d.Hodyn!=nil,hours)
}
}
if err!=nil{pbe(w,err);return};var out any=map[string]bool{"ok":true};if r.Method!=http.MethodDelete{out,err=amrGet(ctx,tx,d.Id);if err!=nil{pbe(w,err);return}};if err=tx.Commit(ctx);err!=nil{pbe(w,err);return};pbj(w,out)
}
func amrError(w http.ResponseWriter,err error){var pgerr interface{SQLState()string};if errors.As(err,&pgerr)&&pgerr.SQLState()=="P0001"&&strings.Contains(err.Error(),"askmr_closed"){pbe(w,&Pe{409,"питання закрите"});return};pbe(w,err)}
func amrAnswers(w http.ResponseWriter,r *http.Request){
ctx,can,uid,ok:=pbw(w,r,"GET,POST,PUT,DELETE");defer can();if !ok{return}
if r.Method==http.MethodGet{
id,err:=pbi(r.URL.Query().Get("pytannia_id"));if err!=nil{pbe(w,err);return};page,err:=amrPage(r);if err!=nil{pbe(w,err);return};var exists bool;if err=db.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.askmr_pytannia WHERE id=$1)",id).Scan(&exists);err!=nil{pbe(w,err);return};if !exists{pbe(w,pgx.ErrNoRows);return}
var count int;if err=db.QueryRow(ctx,"SELECT count(*) FROM public.askmr_vidpovidi WHERE pytannia_id=$1",id).Scan(&count);err!=nil{pbe(w,err);return};items,err:=pbl(ctx,db,amrA+"WHERE v.pytannia_id=$1 ORDER BY (v.id=COALESCE((SELECT k.vidpovid_id FROM public.askmr_krashchi k WHERE k.pytannia_id=v.pytannia_id),0)) DESC,v.stvoreno DESC,v.id DESC LIMIT 20 OFFSET $2",id,(page-1)*20);if err!=nil{pbe(w,err);return};pbj(w,map[string]any{"items":items,"total":count,"page":page,"more":page*20<count});return
}
var d amrBody;var err error;if r.Method==http.MethodDelete{d.Id,err=pbi(r.URL.Query().Get("id"))}else{err=amrRead(w,r,&d)};if err!=nil{pbe(w,err);return}
if d.Nazva!=""||d.Katehoriia!=""||d.Hodyn!=nil||d.Vazhlyvist!=0||d.Maks!=0{pbe(w,&Pe{400,"невірні дані запиту"});return}
if r.Method==http.MethodPost{if d.PytanniaID<=0||d.PytanniaID>2147483647{pbe(w,&Pe{400,"невірні дані запиту"});return}}else if d.Id<=0||d.Id>2147483647{pbe(w,&Pe{400,"невірні дані запиту"});return}
if r.Method!=http.MethodDelete{if err=amrValid(&d,false);err!=nil{pbe(w,err);return}}
if r.Method==http.MethodPost&&!amrRate(ctx,w,uid,"vidpovidi",120){return}
tx,err:=db.Begin(ctx);if err!=nil{pbe(w,err);return};defer tx.Rollback(ctx)
if r.Method!=http.MethodPost{if err=tx.QueryRow(ctx,"SELECT pytannia_id FROM public.askmr_vidpovidi WHERE id=$1",d.Id).Scan(&d.PytanniaID);err!=nil{pbe(w,err);return}}
if _,err=amrLock(ctx,tx,d.PytanniaID);err!=nil{pbe(w,err);return}
if r.Method==http.MethodPost{
var closed bool;if err=tx.QueryRow(ctx,"SELECT "+amrClosed+" FROM public.askmr_pytannia q WHERE q.id=$1",d.PytanniaID).Scan(&closed);err!=nil{pbe(w,err);return};if closed{pbe(w,&Pe{409,"питання закрите"});return}
err=tx.QueryRow(ctx,"INSERT INTO public.askmr_vidpovidi(pytannia_id,avtor_id,tekst,fotky) VALUES($1,$2,$3,$4) RETURNING id",d.PytanniaID,uid,d.Tekst,d.Fotky).Scan(&d.Id)
if err==nil{_,err=tx.Exec(ctx,"UPDATE public.askmr_pytannia q SET zakryto=true WHERE q.id=$1 AND q.maks_vidpovidei>0 AND (SELECT count(*) FROM public.askmr_vidpovidi v WHERE v.pytannia_id=q.id)>=q.maks_vidpovidei",d.PytanniaID)}
}else{
var owner int;if err=tx.QueryRow(ctx,"SELECT avtor_id FROM public.askmr_vidpovidi WHERE id=$1 AND pytannia_id=$2 FOR UPDATE",d.Id,d.PytanniaID).Scan(&owner);err!=nil{pbe(w,err);return}
if r.Method==http.MethodDelete{allowed,e:=amrCanDelete(ctx,tx,owner,uid);if e!=nil{pbe(w,e);return};if !allowed{pbe(w,&Pe{403,"немає доступу"});return};_,err=tx.Exec(ctx,"DELETE FROM public.askmr_vidpovidi WHERE id=$1",d.Id)}else{if owner!=uid{pbe(w,&Pe{403,"немає доступу"});return};_,err=tx.Exec(ctx,"UPDATE public.askmr_vidpovidi SET tekst=$2,fotky=$3,zmineno=clock_timestamp() WHERE id=$1",d.Id,d.Tekst,d.Fotky)}
}
if err!=nil{amrError(w,err);return};var item map[string]any;if r.Method!=http.MethodDelete{if err=tx.QueryRow(ctx,amrA+"WHERE v.id=$1",d.Id).Scan(&item);err!=nil{pbe(w,err);return}}
question,err:=amrGet(ctx,tx,d.PytanniaID);if err!=nil{pbe(w,err);return};if err=tx.Commit(ctx);err!=nil{pbe(w,err);return};pbj(w,map[string]any{"item":item,"question":question,"ok":true})
}
func amrManage(w http.ResponseWriter,r *http.Request){
ctx,can,uid,ok:=pbw(w,r,"POST");defer can();if !ok{return};var d struct{Id int `json:"id"`;Diia string `json:"diia"`;VidpovidID int `json:"vidpovid_id"`};if err:=amrRead(w,r,&d);err!=nil{pbe(w,err);return};if d.Id<=0||d.Id>2147483647||(d.Diia!="zakryty"&&d.Diia!="krashcha"){pbe(w,&Pe{400,"невірні дані запиту"});return}
tx,err:=db.Begin(ctx);if err!=nil{pbe(w,err);return};defer tx.Rollback(ctx);owner,err:=amrLock(ctx,tx,d.Id);if err!=nil{pbe(w,err);return};if owner!=uid{pbe(w,&Pe{403,"немає доступу"});return}
if d.Diia=="zakryty"{_,err=tx.Exec(ctx,"UPDATE public.askmr_pytannia SET zakryto=true WHERE id=$1",d.Id)}else{
if d.VidpovidID<0||d.VidpovidID>2147483647{pbe(w,&Pe{400,"невірні дані запиту"});return};if d.VidpovidID==0{_,err=tx.Exec(ctx,"DELETE FROM public.askmr_krashchi WHERE pytannia_id=$1",d.Id)}else{var exists bool;err=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.askmr_vidpovidi WHERE id=$1 AND pytannia_id=$2)",d.VidpovidID,d.Id).Scan(&exists);if err==nil&&!exists{pbe(w,&Pe{400,"невірні дані запиту"});return};if err==nil{_,err=tx.Exec(ctx,"INSERT INTO public.askmr_krashchi(pytannia_id,vidpovid_id) VALUES($1,$2) ON CONFLICT(pytannia_id) DO UPDATE SET vidpovid_id=EXCLUDED.vidpovid_id",d.Id,d.VidpovidID)}}
}
if err!=nil{pbe(w,err);return};item,err:=amrGet(ctx,tx,d.Id);if err!=nil{pbe(w,err);return};if err=tx.Commit(ctx);err!=nil{pbe(w,err);return};pbj(w,item)
}

const hsMaxFile=512<<10
const hsMaxTotal=5<<20
var hsName=regexp.MustCompile(`^[A-Za-z0-9][A-Za-z0-9_.-]{0,89}\.(html|css)$`)
var hsSlug=regexp.MustCompile(`^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$`)
var hsVersion=regexp.MustCompile(`^[a-f0-9]{32}$`)
var hsBad=regexp.MustCompile("(?i)(?:javascript|vbscript|ecmascript|livescript)\\s*:|<\\s*[/!]?\\s*(?:script|iframe|object|embed|svg|math)\\b|\\b(?:eval|alert|prompt|confirm|fetch|settimeout|setinterval|function|require|importscripts)\\s*\\(|\\b(?:window|document|globalthis|location)\\s*[.\\[]|\\b(?:const|let|var|import|export)\\s+[a-z_$]|=>|`|\\x00")
var hsProps=hsWords("color background background-color opacity display visibility overflow overflow-x overflow-y width height min-width min-height max-width max-height margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left border border-width border-style border-color border-top border-right border-bottom border-left border-radius border-collapse border-spacing outline outline-width outline-style outline-color outline-offset box-sizing box-shadow text-shadow font font-size font-family font-weight font-style font-variant line-height letter-spacing word-spacing text-align text-decoration text-transform text-indent white-space word-break overflow-wrap vertical-align list-style-type list-style-position position top right bottom left z-index float clear flex flex-direction flex-wrap flex-grow flex-shrink flex-basis align-items align-content align-self justify-content justify-items justify-self gap row-gap column-gap order grid grid-template-columns grid-template-rows grid-column grid-row grid-auto-flow grid-auto-columns grid-auto-rows table-layout caption-side empty-cells content cursor user-select transform transform-origin transition transition-property transition-duration transition-delay transition-timing-function")
var hsFuncs=hsWords("rgb rgba hsl hsla calc min max clamp linear-gradient radial-gradient repeating-linear-gradient repeating-radial-gradient translate translatex translatey scale scalex scaley rotate skew skewx skewy matrix cubic-bezier steps repeat minmax fit-content nth-child nth-of-type not is where media and or screen print all")
var hsTags=hsWords("a abbr acronym address area article aside audio b bdi bdo big blink blockquote body br button canvas caption center cite code col colgroup data datalist dd del details dfn dialog dir div dl dt em fieldset figcaption figure font footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i img input ins kbd label legend li link main map mark marquee menu meta meter nav nobr noscript ol optgroup option output p picture pre progress q rp rt ruby s samp search section select selectedcontent slot small source span strike strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr")
var hsVoid=hsWords("area br col hr img input link meta source track wbr")
func hsWords(s string)map[string]bool{m:=map[string]bool{};for _,v:=range strings.Fields(s){m[v]=true};return m}
func hsFileName(s string)bool{return hsName.MatchString(s)&&!strings.Contains(s,"..")}
func hsAddress(s string)bool{return hsSlug.MatchString(s)&&!strings.HasPrefix(s,"xn--")&&!hsWords("www o mail api admin auth login accounts static assets cdn img images files hosting pages support status ns ns1 ns2 smtp imap pop pop3 ftp webmail autoconfig autodiscover mriya cdhelqmotvlk")[s]}
func hsInvalid()error{return &Pe{400,"невірні файли"}}
func hsLimit()error{return &Pe{413,"перевищено ліміт"}}
var hx=regexp.MustCompile(`(?is)<\?(?:php\b|=)|<%|<!--\s*#(?:exec|include|config|echo|printenv|set)\b`)
func hsCleanText(s string)bool{if !utf8.ValidString(s)||hsBad.MatchString(html.UnescapeString(s))||hx.MatchString(html.UnescapeString(s)){return false};for _,r:=range s{if r<32&&r!='\n'&&r!='\r'&&r!='\t'||r==127{return false}};return true}
func hsCSS(s string)(string,error){
if len(s)>hsMaxFile||!hsCleanText(s)||strings.ContainsAny(s,"\\<>"){return "",hsInvalid()};var b strings.Builder
for i:=0;i<len(s);{if i+1<len(s)&&s[i:i+2]=="/*"{j:=strings.Index(s[i+2:],"*/");if j<0{return "",hsInvalid()};i+=j+4;continue};if s[i]=='\''||s[i]=='"'{q:=s[i];j:=i+1;for j<len(s)&&s[j]!=q{if s[j]=='\n'||s[j]=='\r'{return "",hsInvalid()};j++};if j==len(s){return "",hsInvalid()};b.WriteString(s[i:j+1]);i=j+1;continue};b.WriteByte(s[i]);i++};s=b.String();if hsBad.MatchString(s){return "",hsInvalid()}
for i:=0;i<len(s);{c:=s[i];if c=='\''||c=='"'{q:=c;i++;for i<len(s)&&s[i]!=q{i++};i++;continue};if c=='@'{if !regexp.MustCompile(`(?i)^@(?:media|supports|container|layer|scope|keyframes|-webkit-keyframes|font-face|page|property|counter-style|starting-style)\b`).MatchString(s[i:]){return "",hsInvalid()};i++;continue};if c=='!'{if !regexp.MustCompile(`(?i)^!\s*important\s*(;|}|$)`).MatchString(s[i:]){return "",hsInvalid()};i++;continue};if c==92||c==0{return "",hsInvalid()};if hsLetter(c)||c=='-'{j:=i+1;for j<len(s)&&(hsLetter(s[j])||hsDigit(s[j])||s[j]=='-'||s[j]=='_'){j++};k:=j;for k<len(s)&&hsSpace(s[k]){k++};if k<len(s)&&s[k]=='('{if strings.EqualFold(s[i:j],"expression"){return "",hsInvalid()};if strings.EqualFold(s[i:j],"url"){e:=k+1;q:=byte(0);for e<len(s){if q!=0{if s[e]==q{q=0}}else if s[e]=='\''||s[e]=='"'{q=s[e]}else if s[e]==')'{break};e++};if e>=len(s)||q!=0{return "",hsInvalid()};v:=strings.TrimSpace(s[k+1:e]);if len(v)>=2&&(v[0]=='\''||v[0]=='"'){if v[len(v)-1]!=v[0]{return "",hsInvalid()};v=v[1:len(v)-1]};if _,er:=hu(v,true);er!=nil{return "",er};i=e+1;continue}};i=j;continue};if c>=128{i++;continue};if !hsDigit(c)&&!strings.ContainsRune(" \t\r\n{}:;.,#%()+-*/>=~[]|^$&!",rune(c)){return "",hsInvalid()};i++}
if strings.Contains(s,"{"){if err:=hsCSSRules(s,0);err!=nil{return "",err}}else if err:=hsCSSDecl(s);err!=nil{return "",err};return strings.TrimSpace(s),nil
}
func hsLetter(c byte)bool{return c>='a'&&c<='z'||c>='A'&&c<='Z'||c=='_'}
func hsDigit(c byte)bool{return c>='0'&&c<='9'}
func hsSpace(c byte)bool{return c==' '||c=='\t'||c=='\n'||c=='\r'}
func hsCSSSplit(s string,sep byte)([]string,error){var out []string;start,depth:=0,0;var q byte;for i:=0;i<len(s);i++{c:=s[i];if q!=0{if c==q{q=0};continue};if c=='\''||c=='"'{q=c;continue};if c=='('||c=='['{depth++;if depth>8{return nil,hsInvalid()}};if c==')'||c==']'{depth--;if depth<0{return nil,hsInvalid()}};if c==sep&&depth==0{out=append(out,s[start:i]);start=i+1}};if q!=0||depth!=0{return nil,hsInvalid()};return append(out,s[start:]),nil}
func hsCSSDecl(s string)error{ss,er:=hsCSSSplit(s,';');if er!=nil{return er};for _,d:=range ss{d=strings.TrimSpace(d);if d==""{continue};if strings.ContainsAny(d,"{}"){return hsInvalid()};p:=strings.IndexByte(d,':');if p<=0||(!regexp.MustCompile(`^(?:--[\pL\pN_-]+|[-a-zA-Z][a-zA-Z0-9-]*)$`).MatchString(strings.TrimSpace(d[:p]))||hsWords("behavior -ms-behavior -moz-binding")[strings.ToLower(strings.TrimSpace(d[:p]))])||strings.TrimSpace(d[p+1:])==""{return hsInvalid()};if _,er=hsCSSSplit(d[p+1:],';');er!=nil{return er}};return nil}
var hsMedia=regexp.MustCompile(`(?i)^@media\s+(?:(?:all|screen|print)\s*)?(?:(?:and\s*)?\((?:(?:min-|max-)?(?:width|height)\s*:\s*[0-9]+(?:\.[0-9]+)?(?:px|em|rem)|orientation\s*:\s*(?:portrait|landscape)|prefers-color-scheme\s*:\s*(?:dark|light))\)\s*)+$`)
func hsCSSRules(s string,depth int)error{if depth>3{return hsInvalid()};for strings.TrimSpace(s)!=""{s=strings.TrimSpace(s);i:=strings.IndexByte(s,'{');if i<=0{return hsInvalid()};sel:=strings.TrimSpace(s[:i]);media:=strings.HasPrefix(sel,"@");if len(sel)>512{return hsInvalid()};if media{if !regexp.MustCompile(`(?i)^@(?:media|supports|container|layer|scope|keyframes|-webkit-keyframes|font-face|page|property|counter-style|starting-style)\b[^;{}]*$`).MatchString(sel){return hsInvalid()}}else{if strings.ContainsAny(sel,"{};@\\<"){return hsInvalid()};if _,er:=hsCSSSplit(sel,',');er!=nil{return er}};q:=byte(0);end:=-1;level:=1;for j:=i+1;j<len(s);j++{c:=s[j];if q!=0{if c==q{q=0};continue};if c=='\''||c=='"'{q=c;continue};if c=='{'{level++};if c=='}'{level--;if level==0{end=j;break}}};if end<0{return hsInvalid()};if media{if regexp.MustCompile(`(?i)^@(?:font-face|page|property|counter-style)\b`).MatchString(sel){if er:=hsCSSDecl(s[i+1:end]);er!=nil{return er}}else if er:=hsCSSRules(s[i+1:end],depth+1);er!=nil{return er}}else if er:=hsCSSDecl(s[i+1:end]);er!=nil{return er};s=s[end+1:]};return nil}

type hsToken struct{tag string;attrs map[string]string;end,void bool}
func hu(s string,im bool)(string,error){s=strings.TrimSpace(s);if s==""||len(s)>8192||!utf8.ValidString(s)||strings.ContainsAny(s,"\\\"<>`"){return "",hsInvalid()};for _,r:=range s{if r<=32||r==127{return "",hsInvalid()}};if !im&&(strings.HasPrefix(s,"#")||hsFileName(strings.SplitN(s,"#",2)[0])&&strings.HasSuffix(strings.SplitN(s,"#",2)[0],".html")){return s,nil};u,e:=url.Parse(s);if e!=nil||u.User!=nil||u.Opaque!=""||u.Host==""||u.Hostname()==""{return "",hsInvalid()};u.Scheme=strings.ToLower(u.Scheme);if u.Scheme!="https"&&(im||u.Scheme!="http"){return "",hsInvalid()};if u.Port()!=""{n,e:=strconv.Atoi(u.Port());if e!=nil||n<1||n>65535{return "",hsInvalid()}};h:=strings.ToLower(strings.TrimSuffix(u.Hostname(),"."));if !strings.Contains(h,".")||hsWords("localhost localhost.localdomain")[h]||strings.HasSuffix(h,".localhost")||strings.HasSuffix(h,".local")||strings.HasSuffix(h,".internal"){return "",hsInvalid()};if hsWords("mriya.ink www.mriya.ink o.mriya.ink")[h]&&(u.Path=="/api"||strings.HasPrefix(u.Path,"/api/")){return "",hsInvalid()};return u.String(),nil}
func hv(s string)(string,error){var b strings.Builder;for _,ss:=range strings.Split(s,","){ff:=strings.Fields(ss);if len(ff)<1||len(ff)>2{return "",hsInvalid()};vv,er:=hu(ff[0],true);if er!=nil{return "",er};if len(ff)==2&&!regexp.MustCompile(`^(?:[1-9][0-9]*w|(?:[0-9]+(?:\.[0-9]+)?|\.[0-9]+)x)$`).MatchString(ff[1]){return "",hsInvalid()};if b.Len()>0{b.WriteString(", ")};b.WriteString(vv);if len(ff)==2{b.WriteByte(' ');b.WriteString(ff[1])}};return b.String(),nil}
func hsTag(s string)(hsToken,error){
t:=hsToken{attrs:map[string]string{}};s=strings.TrimSpace(s);if strings.HasPrefix(s,"/"){t.end=true;s=strings.TrimSpace(s[1:])};if strings.HasSuffix(s,"/"){if t.end{return t,hsInvalid()};t.void=true;s=strings.TrimSpace(s[:len(s)-1])};i:=0;for i<len(s)&&(hsLetter(s[i])||hsDigit(s[i])){i++};if i==0{return t,hsInvalid()};t.tag=strings.ToLower(s[:i]);if !hsTags[t.tag]{return t,hsInvalid()};s=s[i:];if t.end{if strings.TrimSpace(s)!=""||hsVoid[t.tag]{return t,hsInvalid()};return t,nil};if t.void&&!hsVoid[t.tag]{return t,hsInvalid()};t.void=hsVoid[t.tag]
for strings.TrimSpace(s)!=""{if !hsSpace(s[0]){return t,hsInvalid()};s=strings.TrimLeft(s," \t\r\n");i=0;for i<len(s)&&(hsLetter(s[i])||hsDigit(s[i])||s[i]=='-'||s[i]=='_'||s[i]==':'||s[i]=='.'){i++};if i==0{return t,hsInvalid()};k:=strings.ToLower(s[:i]);if _,ok:=t.attrs[k];ok{return t,hsInvalid()};rr:=s[i:];s=strings.TrimLeft(rr," \t\r\n");v:="";if strings.HasPrefix(s,"="){s=strings.TrimLeft(s[1:]," \t\r\n");if len(s)==0{return t,hsInvalid()};if s[0]=='\''||s[0]=='"'{q:=s[0];j:=strings.IndexByte(s[1:],q);if j<0{return t,hsInvalid()};v=s[1:j+1];s=s[j+2:]}else{j:=0;for j<len(s)&&!hsSpace(s[j]){if strings.ContainsRune("\"'<>=`",rune(s[j])){return t,hsInvalid()};j++};v=s[:j];s=s[j:]}}else{s=rr};v=html.UnescapeString(v);if !hsCleanText(v)||len(v)>8192||len(t.attrs)>=128{return t,hsInvalid()};t.attrs[k]=v}
for k,v:=range t.attrs{if strings.HasPrefix(k,"on")||strings.HasPrefix(k,"xmlns")||strings.HasPrefix(k,"xlink:")||hsWords("srcdoc ping attributionsrc manifest codebase archive classid data http-equiv is")[k]{return t,hsInvalid()};if k=="style"{cc,er:=hsCSS(v);if er!=nil{return t,er};if er=hsCSSDecl(cc);er!=nil{return t,er};t.attrs[k]=cc};if k=="href"{if t.tag=="link"{if !hsFileName(v)||!strings.HasSuffix(v,".css"){return t,hsInvalid()}}else{vv,er:=hu(v,false);if er!=nil{return t,er};t.attrs[k]=vv}};if hsWords("src poster background cite longdesc action formaction")[k]{if k=="src"&&!hsWords("img source audio video track input")[t.tag]{return t,hsInvalid()};vv,er:=hu(v,true);if er!=nil{return t,er};t.attrs[k]=vv};if k=="srcset"||k=="imagesrcset"{vv,er:=hv(v);if er!=nil{return t,er};t.attrs[k]=vv};if k=="charset"{if t.tag!="meta"||!strings.EqualFold(v,"utf-8"){return t,hsInvalid()};t.attrs[k]="utf-8"};if k=="type"&&t.tag=="style"&&!strings.EqualFold(v,"text/css"){return t,hsInvalid()}}
if t.tag=="link"&&t.attrs["rel"]!="stylesheet"{return t,hsInvalid()};if t.tag=="a"||t.tag=="area"{for _,vv:=range []string{"noopener","noreferrer"}{if !hsWords(strings.ToLower(t.attrs["rel"]))[vv]{t.attrs["rel"]=strings.TrimSpace(t.attrs["rel"]+" "+vv)}}};return t,nil
}
func hsHTML(s string,files map[string][]byte,base string)(string,error){
if len(s)>hsMaxFile||!hsCleanText(s){return "",hsInvalid()};var b strings.Builder;stack:=[]string{};tags:=0
for i:=0;i<len(s);{if s[i]!='<'{j:=strings.IndexByte(s[i:],'<');if j<0{j=len(s)-i};v:=html.UnescapeString(s[i:i+j]);if !hsCleanText(v){return "",hsInvalid()};b.WriteString(html.EscapeString(v));i+=j;continue};if strings.HasPrefix(s[i:],"<!--"){j:=strings.Index(s[i+4:],"-->");if j<0{return "",hsInvalid()};i+=j+7;continue};if strings.HasPrefix(strings.ToLower(s[i:]),"<!doctype html>"){i+=15;continue};j:=i+1;q:=byte(0);for j<len(s){c:=s[j];if q!=0{if c==q{q=0}}else if c=='\''||c=='"'{q=c}else if c=='>'{break};j++};if j>=len(s){return "",hsInvalid()};t,er:=hsTag(s[i+1:j]);if er!=nil{return "",er};i=j+1;tags++;if tags>10000||len(stack)>100{return "",hsInvalid()};if t.end{if len(stack)==0||stack[len(stack)-1]!=t.tag{return "",hsInvalid()};stack=stack[:len(stack)-1];b.WriteString("</"+t.tag+">");continue};if t.tag=="style"{rx:=regexp.MustCompile(`(?i)</style\s*>`);loc:=rx.FindStringIndex(s[i:]);if loc==nil{return "",hsInvalid()};cc,er:=hsCSS(s[i:i+loc[0]]);if er!=nil{return "",er};b.WriteString("<style");if vv,ok:=t.attrs["media"];ok{b.WriteString(" media=\""+html.EscapeString(vv)+"\"")};b.WriteString(">"+cc+"</style>");i+=loc[1];continue};if t.tag=="link"&&files!=nil{cc,ok:=files[t.attrs["href"]];if !ok{return "",hsInvalid()};b.WriteString("<style");if vv,ok:=t.attrs["media"];ok{b.WriteString(" media=\""+html.EscapeString(vv)+"\"")};b.WriteString(">"+string(cc)+"</style>");continue};if t.tag=="a"||t.tag=="area"{if href,ok:=t.attrs["href"];ok&&!strings.HasPrefix(href,"https://")&&!strings.HasPrefix(href,"http://"){parts:=strings.SplitN(href,"#",2);if len(parts)==2&&!regexp.MustCompile(`^[A-Za-z0-9_-]*$`).MatchString(parts[1]){return "",hsInvalid()};if parts[0]!=""{if !hsFileName(parts[0])||!strings.HasSuffix(parts[0],".html"){return "",hsInvalid()};if files!=nil{if _,ok:=files[parts[0]];!ok{return "",hsInvalid()};t.attrs["href"]=base+parts[0];if len(parts)==2{t.attrs["href"]+="#"+parts[1]}}}}};b.WriteString("<"+t.tag);keys:=make([]string,0,len(t.attrs));for k:=range t.attrs{keys=append(keys,k)};sort.Strings(keys);for _,k:=range keys{b.WriteString(" "+k+"=\""+html.EscapeString(t.attrs[k])+"\"")};b.WriteString(">");if !t.void{stack=append(stack,t.tag)}}
if len(stack)!=0{return "",hsInvalid()};return b.String(),nil
}
const hsPolicy="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src https:; media-src https:; font-src https:; connect-src 'none'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'"
const hsUserPolicy="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src https:; media-src https:; font-src https:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
func hsDoc(s string)string{return "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"referrer\" content=\"no-referrer\"><meta http-equiv=\"Content-Security-Policy\" content=\""+hsUserPolicy+"\"></head><body>"+s+"</body></html>"}
func hsInner(s string,files map[string][]byte,base string)(string,error){body,er:=hsHTML(s,files,base);if er!=nil{return "",er};return hsDoc(body),nil}
func hsOuter(inner,title string)[]byte{inner=hsDoc(inner);return []byte("<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta http-equiv=\"Content-Security-Policy\" content=\""+hsPolicy+"\"><title>"+html.EscapeString(title)+"</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}iframe{display:block;width:100%;height:100%;border:0}</style></head><body><iframe sandbox=\"\" referrerpolicy=\"no-referrer\" title=\""+html.EscapeString(title)+"\" srcdoc=\""+html.EscapeString(inner)+"\"></iframe></body></html>")}

var hsHome="/srv/mriya-hosting/sites"
var hsJournal="/srv/mriya-hosting/journal"
var hsHelper="/usr/local/sbin/mriya-hosting-link"
var hsBootErr error
var hsExecute=func(ctx context.Context,args ...string)(string,error){if e:=ctx.Err();e!=nil{return "",e};bg,cc:=context.WithTimeout(context.Background(),15*time.Second);defer cc();a:=append([]string{"-n",hsHelper},args...);cmd:=exec.CommandContext(bg,"/usr/bin/sudo",a...);cmd.WaitDelay=3*time.Second;cmd.Env=[]string{"PATH=/usr/sbin:/usr/bin:/sbin:/bin","LANG=C.UTF-8"};b,e:=cmd.CombinedOutput();if e!=nil{return "",fmt.Errorf("hosting publisher: %w",e)};return strings.TrimSpace(string(b)),nil}
type hsFile struct{Pa string `json:"pa"`;Sz int `json:"sz"`}
type hsSite struct{Id int `json:"id"`;Uid int `json:"uid"`;Nazva string `json:"nazva"`;Opis string `json:"opis"`;Adres string `json:"adres"`;Dir string `json:"dir"`;Link string `json:"link"`;Files []hsFile `json:"files"`;Zmineno time.Time `json:"zmineno"`;Obsiag int `json:"-"`}
type hsUpload struct{Id int `json:"id"`;Nazva string `json:"nazva"`;Opis string `json:"opis"`;Adres string `json:"adres"`;Remove []string `json:"remove"`;Files []struct{Path string `json:"path"`;Size int `json:"size"`} `json:"files"`}
type hsLog struct{Id int `json:"id"`;Adres string `json:"adres"`;Version string `json:"version"`}
const hsSelect="SELECT id,uid,nazva,opis,adres,dir,link,faily,zmineno,obsiag FROM public.hostingsites "
func hsError(w http.ResponseWriter,e error){var pe *Pe;if errors.As(e,&pe){w.WriteHeader(pe.St);pbj(w,map[string]string{"error":pe.Msg});return};var pg interface{SQLState()string};if errors.As(e,&pg)&&pg.SQLState()=="23505"{w.WriteHeader(409);pbj(w,map[string]string{"error":"невірні дані запиту"});return};if errors.Is(e,pgx.ErrNoRows){w.WriteHeader(404);pbj(w,map[string]string{"error":"не знайдено"});return};fmt.Fprintln(os.Stderr,"hosting:",e);w.WriteHeader(500);pbj(w,map[string]string{"error":"помилка збереження"})}
func hsAuth(w http.ResponseWriter,r *http.Request,methods string)(context.Context,context.CancelFunc,int,bool){w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");w.Header().Set("X-Content-Type-Options","nosniff");ctx,can:=context.WithTimeout(r.Context(),45*time.Second);fail:=func(e error)(context.Context,context.CancelFunc,int,bool){hsError(w,e);return ctx,can,0,false};if !strings.Contains(","+methods+",",","+r.Method+","){w.Header().Set("Allow",strings.ReplaceAll(methods,",",", "));return fail(&Pe{405,"метод не підтримується"})};if hsBootErr!=nil{return fail(hsBootErr)};s,e:=st.Get(r,"s");uid:=0;if e==nil{uid,_=s.Values["uid"].(int)};if uid<=0{return fail(&Pe{401,"увійди в акаунт"})};if r.Method!="GET"{o:=r.Header.Get("Origin");ref:=false;if o==""{o=r.Header.Get("Referer");ref=true};u,e:=url.Parse(o);if o==""||r.Header.Get("Sec-Fetch-Site")=="cross-site"||e!=nil||u.User!=nil||(u.Scheme!="http"&&u.Scheme!="https")||!strings.EqualFold(u.Host,r.Host)||(!ref&&(u.Path!=""&&u.Path!="/"||u.RawQuery!=""||u.Fragment!="")){return fail(&Pe{403,"немає доступу"})}};var ok bool;if e=db.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)",uid).Scan(&ok);e!=nil{return fail(e)};if !ok{return fail(&Pe{401,"увійди в акаунт"})};return ctx,can,uid,true}
func hsScan(row pgx.Row)(hsSite,error){var s hsSite;var b []byte;e:=row.Scan(&s.Id,&s.Uid,&s.Nazva,&s.Opis,&s.Adres,&s.Dir,&s.Link,&b,&s.Zmineno,&s.Obsiag);if e==nil{e=json.Unmarshal(b,&s.Files)};return s,e}
func hsGet(ctx context.Context,q Pq,id int)(hsSite,error){return hsScan(q.QueryRow(ctx,hsSelect+"WHERE id=$1",id))}
func hsPart(w http.ResponseWriter,r *http.Request)(hsUpload,map[string][]byte,error){
var d hsUpload;out:=map[string][]byte{};sizes:=map[string]int{};r.Body=http.MaxBytesReader(w,r.Body,6<<20);mr,e:=r.MultipartReader();if e!=nil{return d,nil,&Pe{415,"невірні дані запиту"}};meta:=false;total:=0
for{p,e:=mr.NextRawPart();if e==io.EOF{break};if e!=nil{return d,nil,hsInvalid()};mt,pa,e:=mime.ParseMediaType(p.Header.Get("Content-Disposition"));if e!=nil||mt!="form-data"||len(p.Header)>2||len(p.Header["Content-Disposition"])!=1||len(p.Header["Content-Type"])>1{return d,nil,hsInvalid()};for k:=range p.Header{if k!="Content-Disposition"&&k!="Content-Type"{return d,nil,hsInvalid()}};for k:=range pa{if k!="name"&&k!="filename"{return d,nil,hsInvalid()}};if pa["name"]=="site"{if meta||pa["filename"]!=""{return d,nil,hsInvalid()};meta=true;b,e:=io.ReadAll(io.LimitReader(p,65537));if e!=nil||len(b)>65536{return d,nil,hsLimit()};dd:=json.NewDecoder(bytes.NewReader(b));dd.DisallowUnknownFields();if e=dd.Decode(&d);e!=nil{return d,nil,&Pe{400,"невірні дані запиту"}};var x any;if dd.Decode(&x)!=io.EOF{return d,nil,hsInvalid()};continue};if pa["name"]!="files"||!hsFileName(pa["filename"])||len(out)>=50{return d,nil,hsInvalid()};name:=pa["filename"];if _,ok:=out[name];ok{return d,nil,hsInvalid()};b,e:=io.ReadAll(io.LimitReader(p,hsMaxFile+1));if e!=nil||len(b)>hsMaxFile{return d,nil,hsLimit()};total+=len(b);if len(b)==0{return d,nil,hsInvalid()};if total>hsMaxTotal{return d,nil,hsLimit()};sizes[name]=len(b);if strings.HasSuffix(name,".css"){cc,e:=hsCSS(string(b));if e!=nil||(!strings.Contains(cc,"{")&&cc!=""){return d,nil,hsInvalid()};b=[]byte(cc)}else{cc,e:=hsHTML(string(b),nil,"");if e!=nil{return d,nil,e};b=[]byte(cc)};if len(b)==0||len(b)>hsMaxFile{return d,nil,hsInvalid()};out[name]=b}
if !meta||!pbv(d.Nazva,120)||strings.TrimSpace(d.Nazva)==""||!pbv(d.Opis,2000)||!hsAddress(d.Adres)||len(d.Remove)>50||len(d.Files)!=len(out){return d,nil,&Pe{400,"невірні дані запиту"}};seen:=map[string]bool{};for _,f:=range d.Files{b,ok:=out[f.Path];if !ok||seen[f.Path]||f.Size<1||f.Size!=sizes[f.Path]||f.Size>hsMaxFile||len(b)>hsMaxFile{return d,nil,hsInvalid()};seen[f.Path]=true};seen=map[string]bool{};for _,name:=range d.Remove{if !hsFileName(name)||seen[name]||out[name]!=nil{return d,nil,hsInvalid()};seen[name]=true};return d,out,nil
}
func hsReadFile(path string)([]byte,error){f,e:=os.OpenFile(path,os.O_RDONLY|syscall.O_NOFOLLOW,0);if e!=nil{return nil,e};defer f.Close();st,e:=f.Stat();if e!=nil||!st.Mode().IsRegular()||st.Size()<1||st.Size()>hsMaxFile{return nil,hsInvalid()};return io.ReadAll(io.LimitReader(f,hsMaxFile+1))}
func hsDir(s hsSite)(string,error){a:=strings.Split(s.Dir,"/");if len(a)!=2||a[0]!=strconv.Itoa(s.Id)||!hsVersion.MatchString(a[1]){return "",hsInvalid()};return filepath.Join(hsHome,a[0],a[1]),nil}
func hsSources(s hsSite)(map[string][]byte,error){p,e:=hsDir(s);if e!=nil{return nil,e};out:=map[string][]byte{};if len(s.Files)>50{return nil,hsInvalid()};for _,f:=range s.Files{if !hsFileName(f.Pa)||f.Sz<=0||f.Sz>hsMaxFile||out[f.Pa]!=nil{return nil,hsInvalid()};b,e:=hsReadFile(filepath.Join(p,"src",f.Pa));if e!=nil{return nil,e};if len(b)!=f.Sz{return nil,hsInvalid()};out[f.Pa]=b};return out,nil}
func hsCompile(files map[string][]byte,s hsSite)(map[string][]byte,[]hsFile,int,error){
if len(files)<1||len(files)>50{return nil,nil,0,hsLimit()};if files["index.html"]==nil{return nil,nil,0,&Pe{400,"потрібен index.html"}};total:=0;keys:=[]string{};for k,b:=range files{if !hsFileName(k)||len(b)<1||len(b)>hsMaxFile{return nil,nil,0,hsInvalid()};total+=len(b);keys=append(keys,k)};if total>hsMaxTotal{return nil,nil,0,hsLimit()};sort.Strings(keys);pub:=map[string][]byte{};manifest:=[]hsFile{};for _,name:=range keys{b:=files[name];if strings.HasSuffix(name,".css"){if _,e:=hsCSS(string(b));e!=nil{return nil,nil,0,e}}else{inner,e:=hsInner(string(b),files,"/"+s.Adres+".ink/");if e!=nil{return nil,nil,0,e};pub[name]=hsOuter(inner,s.Nazva)};total+=len(pub[name]);if total>25<<20{return nil,nil,0,hsLimit()};manifest=append(manifest,hsFile{name,len(b)})};return pub,manifest,total,nil
}
func hsSync(p string)error{f,e:=os.Open(p);if e!=nil{return e};defer f.Close();return f.Sync()}
func hsWrite(p string,b []byte,mode os.FileMode)error{f,e:=os.OpenFile(p,os.O_WRONLY|os.O_CREATE|os.O_EXCL|syscall.O_NOFOLLOW,mode);if e!=nil{return e};if e=f.Chmod(mode);e==nil{_,e=f.Write(b)};if e==nil{e=f.Sync()};ce:=f.Close();if e!=nil{return e};return ce}
func hsFresh(files,pub map[string][]byte,id int)(string,error){var b [16]byte;if _,e:=rand.Read(b[:]);e!=nil{return "",e};v:=hex.EncodeToString(b[:]);base:=filepath.Join(hsHome,strconv.Itoa(id));if e:=os.MkdirAll(base,0755);e!=nil{return "",e};st,e:=os.Lstat(base);if e!=nil||!st.IsDir()||st.Mode()&os.ModeSymlink!=0{return "",hsInvalid()};if e=os.Chmod(base,0755);e!=nil{return "",e};p:=filepath.Join(base,v);if e=os.Mkdir(p,0700);e!=nil{return "",e};ok:=false;defer func(){if !ok{os.RemoveAll(p)}}();if e=os.Mkdir(filepath.Join(p,"src"),0700);e!=nil{return "",e};if e=os.Mkdir(filepath.Join(p,"web"),0755);e!=nil{return "",e};if e=os.Chmod(filepath.Join(p,"web"),0755);e!=nil{return "",e};for n,b:=range files{if e=hsWrite(filepath.Join(p,"src",n),b,0600);e!=nil{return "",e}};for n,b:=range pub{if e=hsWrite(filepath.Join(p,"web",n),b,0644);e!=nil{return "",e}};for _,d:=range []string{filepath.Join(p,"src"),filepath.Join(p,"web"),p,base}{if e=hsSync(d);e!=nil{return "",e}};if e=os.Chmod(p,0755);e!=nil{return "",e};if e=hsSync(p);e!=nil{return "",e};if e=hsSync(base);e!=nil{return "",e};ok=true;return v,nil}
func hsLogWrite(j hsLog)(string,error){var b [16]byte;if _,e:=rand.Read(b[:]);e!=nil{return "",e};p:=filepath.Join(hsJournal,hex.EncodeToString(b[:])+".json");v,_:=json.Marshal(j);if e:=hsWrite(p,v,0600);e!=nil{return "",e};if e:=hsSync(hsJournal);e!=nil{return "",e};return p,nil}
func hsApply(ctx context.Context,s hsSite,v string)error{_,e:=hsExecute(ctx,"set",s.Adres,strconv.Itoa(s.Id),v);return e}
func hsRemove(ctx context.Context,s hsSite)error{_,e:=hsExecute(ctx,"del",s.Adres,strconv.Itoa(s.Id));return e}
func hsRecoverOne(ctx context.Context,q Pq,j hsLog)error{if j.Id<=0||!hsAddress(j.Adres)||j.Version!=""&&!hsVersion.MatchString(j.Version){return hsInvalid()};s,e:=hsGet(ctx,q,j.Id);if errors.Is(e,pgx.ErrNoRows){s=hsSite{Id:j.Id,Adres:j.Adres};if e=hsRemove(ctx,s);e!=nil{return e};return os.RemoveAll(filepath.Join(hsHome,strconv.Itoa(j.Id)))};if e!=nil{return e};p,e:=hsDir(s);if e!=nil{return e};v:=filepath.Base(p);if s.Adres!=j.Adres{return hsInvalid()};if e=hsApply(ctx,s,v);e!=nil{return e};if j.Version!=""&&j.Version!=v{return os.RemoveAll(filepath.Join(hsHome,strconv.Itoa(j.Id),j.Version))};return nil}
func hsRecover()error{ctx,can:=context.WithTimeout(context.Background(),45*time.Second);defer can();tx,e:=db.Begin(ctx);if e!=nil{return e};defer tx.Rollback(ctx);if _,e=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(73519320)");e!=nil{return e};entries,e:=os.ReadDir(hsJournal);if e!=nil{return e};for _,it:=range entries{if it.Type()&os.ModeSymlink!=0||!strings.HasSuffix(it.Name(),".json")||!hsVersion.MatchString(strings.TrimSuffix(it.Name(),".json")){return hsInvalid()};p:=filepath.Join(hsJournal,it.Name());b,e:=hsReadFile(p);if e!=nil{return e};var j hsLog;if e=json.Unmarshal(b,&j);e!=nil{return e};if e=hsRecoverOne(ctx,tx,j);e!=nil{return e};if e=os.Remove(p);e!=nil{return e}};return tx.Commit(ctx)}
func hsCapabilities(w http.ResponseWriter,r *http.Request){w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");if hsBootErr!=nil{hsError(w,hsBootErr);return};var ok bool;if e:=db.QueryRow(r.Context(),"SELECT to_regclass('public.hostingsites') IS NOT NULL").Scan(&ok);e!=nil||!ok{hsError(w,errors.New("hosting schema unavailable"));return};pbj(w,map[string]any{"revision":"hosting-server-v1","server":true,"formats":[]string{"html","css"},"max_files":50,"max_file_bytes":hsMaxFile,"max_site_bytes":hsMaxTotal,"sandbox":true})}
func hsHandle(w http.ResponseWriter,r *http.Request){
ctx,can,uid,ok:=hsAuth(w,r,"GET,POST,PUT,DELETE");defer can();if !ok{return};if r.Method=="GET"{if r.URL.Query().Get("id")!=""{id,e:=pbi(r.URL.Query().Get("id"));if e!=nil{hsError(w,e);return};s,e:=hsGet(ctx,db,id);if e!=nil{hsError(w,e);return};if s.Uid!=uid{hsError(w,&Pe{403,"немає доступу"});return};pbj(w,s);return};rows,e:=db.Query(ctx,hsSelect+"WHERE uid=$1 ORDER BY zmineno DESC,id DESC",uid);if e!=nil{hsError(w,e);return};defer rows.Close();items:=[]hsSite{};for rows.Next(){s,e:=hsScan(rows);if e!=nil{hsError(w,e);return};items=append(items,s)};if e=rows.Err();e!=nil{hsError(w,e);return};pbj(w,map[string]any{"items":items});return}
if e:=asRate(ctx,"hosting:write:"+strconv.Itoa(uid),60,3600);e!=nil{asProblemOut(w,e);return};var d hsUpload;var added map[string][]byte;var e error;if r.Method=="DELETE"{d.Id,e=pbi(r.URL.Query().Get("id"))}else{d,added,e=hsPart(w,r);if e==nil&&((r.Method=="POST"&&d.Id!=0)||(r.Method=="PUT"&&d.Id<=0)){e=&Pe{400,"невірні дані запиту"}}};if e!=nil{hsError(w,e);return}
tx,e:=db.Begin(ctx);if e!=nil{hsError(w,e);return};defer tx.Rollback(context.Background());if _,e=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(73519320)");e!=nil{hsError(w,e);return};s:=hsSite{Uid:uid,Nazva:strings.TrimSpace(d.Nazva),Opis:strings.TrimSpace(d.Opis),Adres:d.Adres};files:=map[string][]byte{};oldVersion:="";if d.Id>0{s,e=hsGet(ctx,tx,d.Id);if e!=nil{hsError(w,e);return};if s.Uid!=uid{hsError(w,&Pe{403,"немає доступу"});return};p,e:=hsDir(s);if e!=nil{hsError(w,e);return};oldVersion=filepath.Base(p);if r.Method!="DELETE"{if d.Adres!=s.Adres{hsError(w,&Pe{400,"невірні дані запиту"});return};files,e=hsSources(s);if e!=nil{hsError(w,e);return};s.Nazva=strings.TrimSpace(d.Nazva);s.Opis=strings.TrimSpace(d.Opis)}}else{var n int;if e=tx.QueryRow(ctx,"SELECT count(*) FROM public.hostingsites WHERE uid=$1",uid).Scan(&n);e!=nil{hsError(w,e);return};if n>=10{hsError(w,hsLimit());return};var ex bool;if e=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.hostingsites WHERE adres=$1)",s.Adres).Scan(&ex);e!=nil{hsError(w,e);return};if ex{hsError(w,&Pe{409,"невірні дані запиту"});return};if e=tx.QueryRow(ctx,"INSERT INTO public.hostingsites(uid,nazva,opis,adres,dir,link) VALUES($1,$2,$3,$4,'pending',$5) RETURNING id",uid,s.Nazva,s.Opis,s.Adres,"/"+s.Adres+".ink/").Scan(&s.Id);e!=nil{hsError(w,e);return}}
mapped,err:=hsExecute(ctx,"get",s.Adres,strconv.Itoa(s.Id));if err!=nil{hsError(w,err);return};if mapped!=""&&mapped!=oldVersion{hsError(w,errors.New("hosting route is out of sync"));return};version:="";journal:="";done:=false;applied:=false;defer func(){if done{return};rc,cc:=context.WithTimeout(context.Background(),15*time.Second);defer cc();restored:=true;if applied{if oldVersion!=""{e=hsApply(rc,s,oldVersion)}else{e=hsRemove(rc,s)};restored=e==nil;if e!=nil{fmt.Fprintln(os.Stderr,"hosting rollback:",e)}};if restored{if version!=""{os.RemoveAll(filepath.Join(hsHome,strconv.Itoa(s.Id),version));if oldVersion==""{os.Remove(filepath.Join(hsHome,strconv.Itoa(s.Id)))}};if journal!=""{os.Remove(journal)}}}()
if r.Method=="DELETE"{journal,e=hsLogWrite(hsLog{s.Id,s.Adres,oldVersion});if e==nil{applied=true;e=hsRemove(ctx,s)};if e==nil{_,e=tx.Exec(ctx,"DELETE FROM public.hostingsites WHERE id=$1 AND uid=$2",s.Id,uid)};if e==nil{e=tx.Commit(ctx)};if e!=nil{hsError(w,e);return};done=true;os.Remove(journal);os.RemoveAll(filepath.Join(hsHome,strconv.Itoa(s.Id)));pbj(w,map[string]bool{"ok":true});return}
for _,name:=range d.Remove{if _,ok:=files[name];!ok{hsError(w,hsInvalid());return};delete(files,name)};for name,b:=range added{files[name]=b};pub,manifest,total,e:=hsCompile(files,s);if e!=nil{hsError(w,e);return};var used,global int;if e=tx.QueryRow(ctx,"SELECT COALESCE(sum(obsiag) FILTER(WHERE uid=$1 AND id<>$2),0),COALESCE(sum(obsiag) FILTER(WHERE id<>$2),0) FROM public.hostingsites",uid,s.Id).Scan(&used,&global);e!=nil{hsError(w,e);return};if used+total>64<<20||global+total>1<<30{hsError(w,hsLimit());return};var disk syscall.Statfs_t;if e=syscall.Statfs(hsHome,&disk);e!=nil{hsError(w,e);return};if disk.Bavail*uint64(disk.Bsize)<uint64(total)+(256<<20){hsError(w,hsLimit());return};version,e=hsFresh(files,pub,s.Id);if e!=nil{hsError(w,e);return};journal,e=hsLogWrite(hsLog{s.Id,s.Adres,version});if e!=nil{hsError(w,e);return};meta,_:=json.Marshal(manifest);dir:=strconv.Itoa(s.Id)+"/"+version;_,e=tx.Exec(ctx,"UPDATE public.hostingsites SET nazva=$2,opis=$3,dir=$4,faily=$5::jsonb,obsiag=$6,zmineno=clock_timestamp() WHERE id=$1",s.Id,s.Nazva,s.Opis,dir,string(meta),total);if e==nil{applied=true;e=hsApply(ctx,s,version)};var result hsSite;if e==nil{result,e=hsGet(ctx,tx,s.Id)};if e==nil{e=tx.Commit(ctx)};if e!=nil{hsError(w,e);return};done=true;os.Remove(journal);if oldVersion!=""{os.RemoveAll(filepath.Join(hsHome,strconv.Itoa(s.Id),oldVersion))};pbj(w,result)
}
func hsFileHandle(w http.ResponseWriter,r *http.Request){ctx,can,uid,ok:=hsAuth(w,r,"GET");defer can();if !ok{return};id,e:=pbi(r.URL.Query().Get("id"));if e!=nil{hsError(w,e);return};s,e:=hsGet(ctx,db,id);if e!=nil{hsError(w,e);return};if s.Uid!=uid{hsError(w,&Pe{403,"немає доступу"});return};name:=r.URL.Query().Get("path");if !hsFileName(name){hsError(w,hsInvalid());return};files,e:=hsSources(s);if e!=nil{hsError(w,e);return};b,ok:=files[name];if !ok{hsError(w,&Pe{404,"не знайдено"});return};w.Header().Set("Content-Type","application/octet-stream");w.Header().Set("Content-Disposition",mime.FormatMediaType("attachment",map[string]string{"filename":name}));w.Header().Set("Content-Security-Policy","sandbox; default-src 'none'");w.Write(b)}
func hsPreview(w http.ResponseWriter,r *http.Request){ctx,can,uid,ok:=hsAuth(w,r,"GET");defer can();if !ok{return};id,e:=pbi(r.URL.Query().Get("id"));if e!=nil{hsError(w,e);return};s,e:=hsGet(ctx,db,id);if e!=nil{hsError(w,e);return};if s.Uid!=uid{hsError(w,&Pe{403,"немає доступу"});return};files,e:=hsSources(s);if e!=nil{hsError(w,e);return};inner,e:=hsInner(string(files["index.html"]),files,"/"+s.Adres+".ink/");if e!=nil{hsError(w,e);return};pbj(w,map[string]string{"html":inner})}

func pcm(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	s, _ := st.Get(r, "s")
	uid, _ := s.Values["uid"].(int)
	if uid <= 0 {
		cme(w, 401, "увійди")
		return
	}
	ctx, can := context.WithTimeout(r.Context(), 10*time.Second)
	defer can()
	rows, err := db.Query(ctx, "SELECT MIN(btrim(misto)) FROM public.useri WHERE btrim(COALESCE(misto,''))<>'' GROUP BY lower(btrim(misto)) ORDER BY lower(MIN(btrim(misto)))")
	if err != nil {
		cme(w, 500, "не вдалося завантажити міста")
		return
	}
	defer rows.Close()
	ls := make([]string, 0)
	for rows.Next() {
		var mi string
		if err = rows.Scan(&mi); err != nil {
			cme(w, 500, "не вдалося завантажити міста")
			return
		}
		ls = append(ls, mi)
	}
	if err = rows.Err(); err != nil {
		cme(w, 500, "не вдалося завантажити міста")
		return
	}
	json.NewEncoder(w).Encode(ls)
}

const mdr = "/opt/mriya/backend/music-files"
const mlm int64 = 100 << 20
const mqq = "id,nazva,failik,genre,uploader,author,albom,godvipuska,opis"

type Mz struct {
	Id int64  `json:"id"`
	Na string `json:"nazva"`
	Fl string `json:"failik"`
	Ge string `json:"genre"`
	Up int    `json:"uploader"`
	Au string `json:"author"`
	Al string `json:"albom"`
	Yr *int   `json:"godvipuska"`
	Op string `json:"opis"`
}

func mue(w http.ResponseWriter, st int, msg string) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(st)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func mus(r pgx.Row) (Mz, error) {
	var v Mz
	err := r.Scan(&v.Id, &v.Na, &v.Fl, &v.Ge, &v.Up, &v.Au, &v.Al, &v.Yr, &v.Op)
	return v, err
}

func mun(v string) bool {
	if len(v) != 36 || (v[32:] != ".mp3" && v[32:] != ".wav") {
		return false
	}
	for _, c := range v[:32] {
		if !(c >= '0' && c <= '9') && !(c >= 'a' && c <= 'f') {
			return false
		}
	}
	return true
}

func muv(v string, n int) bool {
	return utf8.ValidString(v) && !strings.ContainsRune(v, 0) && utf8.RuneCountInString(v) <= n
}

func muh(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodGet {
		mug(w, r)
		return
	}
	if r.Method != http.MethodPost && r.Method != http.MethodDelete {
		w.Header().Set("Allow", "GET, POST, DELETE")
		mue(w, 405, "метод не підтримується")
		return
	}
	s, err := st.Get(r, "s")
	uid := 0
	if err == nil {
		uid, _ = s.Values["uid"].(int)
	}
	if uid <= 0 {
		mue(w, 401, "увійди")
		return
	}
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		mue(w, 403, "запит з іншого сайту заборонено")
		return
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		u, er := url.Parse(origin)
		if er != nil || (u.Scheme != "http" && u.Scheme != "https") || !strings.EqualFold(u.Host, r.Host) || u.User != nil || (u.Path != "" && u.Path != "/") || u.RawQuery != "" || u.Fragment != "" {
			mue(w, 403, "запит з іншого сайту заборонено")
			return
		}
	}
	ctx, can := context.WithTimeout(r.Context(), 10*time.Second)
	var ex bool
	err = db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)", uid).Scan(&ex)
	can()
	if err != nil {
		mue(w, 500, "помилка")
		return
	}
	if !ex {
		mue(w, 401, "увійди знову")
		return
	}
	if r.Method == http.MethodPost {
		ct, _, er := mime.ParseMediaType(r.Header.Get("Content-Type"))
		if er == nil && ct == "application/json" {
			mbpub(w, r, uid)
		} else {
			mup(w, r, uid)
		}
	} else {
		mud(w, r, uid)
	}
}

func mug(w http.ResponseWriter, r *http.Request) {
	ctx, can := context.WithTimeout(r.Context(), 20*time.Second)
	defer can()
	rows, err := db.Query(ctx, "SELECT "+mqq+" FROM public.music ORDER BY id DESC")
	if err != nil {
		mue(w, 500, "не вдалося завантажити музику")
		return
	}
	defer rows.Close()
	ls := make([]Mz, 0)
	for rows.Next() {
		v, er := mus(rows)
		if er != nil {
			mue(w, 500, "не вдалося завантажити музику")
			return
		}
		ls = append(ls, v)
	}
	if rows.Err() != nil {
		mue(w, 500, "не вдалося завантажити музику")
		return
	}
	json.NewEncoder(w).Encode(ls)
}

func mfh(b []byte) (int, uint32) {
	if len(b) < 4 {
		return 0, 0
	}
	h := binary.BigEndian.Uint32(b)
	if h&0xffe00000 != 0xffe00000 || (h>>19)&3 == 1 || (h>>17)&3 != 1 {
		return 0, 0
	}
	br, sr := int((h>>12)&15), int((h>>10)&3)
	if br == 0 || br == 15 || sr == 3 {
		return 0, 0
	}
	fq := []int{44100, 48000, 32000}[sr]
	vr := int((h >> 19) & 3)
	kb := []int{0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320}[br]
	cf := 144000
	if vr != 3 {
		kb = []int{0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160}[br]
		fq /= 2
		cf = 72000
	}
	if vr == 0 {
		fq /= 2
	}
	return cf*kb/fq + int((h>>9)&1), h & 0x001e0c00
}

func mft(f *os.File, n int64, ext string) bool {
	var b [12]byte
	if _, err := f.ReadAt(b[:], 0); err != nil {
		return false
	}
	if ext == ".wav" {
		if string(b[:4]) != "RIFF" || string(b[8:]) != "WAVE" {
			return false
		}
		end := int64(binary.LittleEndian.Uint32(b[4:8])) + 8
		if end > n || end < 44 {
			return false
		}
		fmtok, data := false, false
		for off := int64(12); off+8 <= end; {
			var h [8]byte
			if _, err := f.ReadAt(h[:], off); err != nil {
				return false
			}
			z := int64(binary.LittleEndian.Uint32(h[4:]))
			if off+8+z > end {
				return false
			}
			if string(h[:4]) == "fmt " {
				if z < 16 {
					return false
				}
				var a [16]byte
				if _, err := f.ReadAt(a[:], off+8); err != nil {
					return false
				}
				t := binary.LittleEndian.Uint16(a[:2])
				fmtok = (t == 1 || t == 3 || t == 0xfffe) && binary.LittleEndian.Uint16(a[2:4]) > 0 && binary.LittleEndian.Uint32(a[4:8]) > 0 && binary.LittleEndian.Uint16(a[12:14]) > 0
			}
			if string(h[:4]) == "data" && z > 0 {
				data = true
			}
			if fmtok && data {
				return true
			}
			off += 8 + z + z%2
		}
		return false
	}
	if ext != ".mp3" {
		return false
	}
	off := int64(0)
	if string(b[:3]) == "ID3" {
		if b[3] < 2 || b[3] > 4 || b[4] == 255 {
			return false
		}
		for _, v := range b[6:10] {
			if v > 127 {
				return false
			}
		}
		off = 10 + (int64(b[6]) << 21) + (int64(b[7]) << 14) + (int64(b[8]) << 7) + int64(b[9])
		if b[3] == 4 && b[5]&16 != 0 {
			off += 10
		}
	}
	if off < 0 || off >= n {
		return false
	}
	z := n - off
	if z > 65536 {
		z = 65536
	}
	a := make([]byte, int(z))
	if _, err := f.ReadAt(a, off); err != nil {
		return false
	}
	for i := 0; i+4 <= len(a); i++ {
		ln, typ := mfh(a[i:])
		if ln == 0 || off+int64(i+ln+4) > n {
			continue
		}
		var h [4]byte
		if _, err := f.ReadAt(h[:], off+int64(i+ln)); err != nil {
			continue
		}
		nx, nt := mfh(h[:])
		if nx > 0 && nt == typ && off+int64(i+ln+nx) <= n {
			return true
		}
	}
	return false
}

func mup(w http.ResponseWriter, r *http.Request, uid int) {
	r.Body = http.MaxBytesReader(w, r.Body, mlm+(1<<20))
	mr, err := r.MultipartReader()
	if err != nil {
		mue(w, 400, "невірні дані запиту")
		return
	}
	if err = os.MkdirAll(mdr, 0755); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	var f *os.File
	var tmp, ext, final string
	keep := false
	m := map[string]string{}
	defer func() {
		if f != nil {
			f.Close()
		}
		if tmp != "" {
			os.Remove(tmp)
		}
		if final != "" && !keep {
			os.Remove(final)
		}
	}()
	for {
		p, er := mr.NextPart()
		if er == io.EOF {
			break
		}
		if er != nil {
			var mx *http.MaxBytesError
			if errors.As(er, &mx) {
				mue(w, 413, "макс 100 МБ")
			} else {
				mue(w, 400, "невірні дані запиту")
			}
			return
		}
		k := p.FormName()
		if p.FileName() != "" {
			if k != "file" || f != nil {
				mue(w, 400, "невірні дані запиту")
				return
			}
			ext = strings.ToLower(filepath.Ext(p.FileName()))
			if ext != ".mp3" && ext != ".wav" {
				mue(w, 400, "тільки MP3 або WAV")
				return
			}
			f, er = os.CreateTemp(mdr, ".upload-")
			if er != nil {
				mue(w, 500, "помилка завантаження")
				return
			}
			tmp = f.Name()
			n, er := io.Copy(f, io.LimitReader(p, mlm+1))
			if n > mlm {
				mue(w, 413, "макс 100 МБ")
				return
			}
			if er != nil {
				mue(w, 400, "помилка завантаження")
				return
			}
			if n == 0 || !mft(f, n, ext) {
				mue(w, 400, "тільки MP3 або WAV")
				return
			}
		} else {
			if k == "uploader" {
				if _, er = io.Copy(io.Discard, io.LimitReader(p, 1025)); er != nil {
					mue(w, 400, "невірні дані запиту")
					return
				}
				p.Close()
				continue
			}
			if k != "nazva" && k != "genre" && k != "author" && k != "albom" && k != "godvipuska" && k != "opis" {
				mue(w, 400, "невірні дані запиту")
				return
			}
			if _, ex := m[k]; ex {
				mue(w, 400, "невірні дані запиту")
				return
			}
			lim := int64(1024)
			if k == "opis" {
				lim = 20000
			}
			b, er := io.ReadAll(io.LimitReader(p, lim+1))
			if er != nil || int64(len(b)) > lim {
				mue(w, 400, "невірні дані запиту")
				return
			}
			m[k] = string(b)
		}
		p.Close()
	}
	na, au, al, ge := strings.TrimSpace(m["nazva"]), strings.TrimSpace(m["author"]), strings.TrimSpace(m["albom"]), strings.TrimSpace(m["genre"])
	if na == "" || au == "" {
		mue(w, 400, "вкажи назву та виконавця")
		return
	}
	if !muv(na, 160) || !muv(au, 160) || !muv(al, 160) || !muv(m["opis"], 5000) {
		mue(w, 400, "невірні дані запиту")
		return
	}
	valid := false
	for _, v := range strings.Fields("pop rock hiphop electronic house techno dnb dubstep trance ambient jazz blues soul funk disco rnb reggae country folk classical metal punk indie soundtrack") {
		if ge == v {
			valid = true
			break
		}
	}
	if !valid {
		mue(w, 400, "невірні дані запиту")
		return
	}
	var yr *int
	if y := strings.TrimSpace(m["godvipuska"]); y != "" {
		v, er := strconv.Atoi(y)
		if er != nil || len(y) != 4 || v < 1000 || v > 9999 {
			mue(w, 400, "невірний рік випуску")
			return
		}
		yr = &v
	}
	if f == nil {
		mue(w, 400, "тільки MP3 або WAV")
		return
	}
	if err = f.Sync(); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	if err = f.Chmod(0644); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	if err = f.Close(); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	var rnd [16]byte
	if _, err = rand.Read(rnd[:]); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	name := hex.EncodeToString(rnd[:]) + ext
	path := filepath.Join(mdr, name)
	ctx, can := context.WithTimeout(r.Context(), 20*time.Second)
	defer can()
	tx, err := db.Begin(ctx)
	if err != nil {
		mue(w, 500, "помилка збереження")
		return
	}
	defer tx.Rollback(ctx)
	v, err := mus(tx.QueryRow(ctx, "INSERT INTO public.music(nazva,failik,genre,uploader,author,albom,godvipuska,opis) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "+mqq, na, "/music-files/"+name, ge, uid, au, al, yr, m["opis"]))
	if err != nil {
		mue(w, 500, "помилка збереження")
		return
	}
	if err = os.Link(tmp, path); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	final = path
	if err = tx.Commit(ctx); err != nil {
		cx, cl := context.WithTimeout(context.Background(), 5*time.Second)
		var ex bool
		er := db.QueryRow(cx, "SELECT EXISTS(SELECT 1 FROM public.music WHERE id=$1 AND failik=$2)", v.Id, v.Fl).Scan(&ex)
		cl()
		keep = ex || er != nil
		fmt.Printf("music commit: %v\n", err)
		mue(w, 500, "помилка збереження")
		return
	}
	keep = true
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(v)
}

func mud(w http.ResponseWriter, r *http.Request, uid int) {
	id, err := strconv.ParseInt(r.URL.Query().Get("id"), 10, 64)
	if err != nil || id <= 0 {
		mue(w, 400, "невірні дані запиту")
		return
	}
	ctx, can := context.WithTimeout(r.Context(), 20*time.Second)
	defer can()
	tx, err := db.Begin(ctx)
	if err != nil {
		mue(w, 500, "помилка")
		return
	}
	defer tx.Rollback(ctx)
	var fl string
	err = tx.QueryRow(ctx, "SELECT failik FROM public.music WHERE id=$1 AND uploader=$2 FOR UPDATE", id, uid).Scan(&fl)
	if errors.Is(err, pgx.ErrNoRows) {
		mue(w, 404, "не знайдено")
		return
	}
	if err != nil {
		mue(w, 500, "помилка")
		return
	}
	name := strings.TrimPrefix(fl, "/music-files/")
	if fl != "/music-files/"+name || !mun(name) {
		mue(w, 500, "помилка")
		return
	}
	path := filepath.Join(mdr, name)
	var tomb string
	fi, er := os.Lstat(path)
	if er == nil {
		if !fi.Mode().IsRegular() {
			mue(w, 500, "помилка")
			return
		}
		f, er := os.CreateTemp(mdr, ".deleted-")
		if er != nil {
			mue(w, 500, "помилка")
			return
		}
		tomb = f.Name()
		f.Close()
		if er = os.Rename(path, tomb); er != nil {
			os.Remove(tomb)
			mue(w, 500, "помилка")
			return
		}
	} else if !os.IsNotExist(er) {
		mue(w, 500, "помилка")
		return
	}
	restore := true
	defer func() {
		if tomb != "" && restore {
			if er := os.Rename(tomb, path); er != nil {
				fmt.Printf("music restore: %v\n", er)
			}
		}
	}()
	if _, err = tx.Exec(ctx, "DELETE FROM public.music WHERE id=$1 AND uploader=$2", id, uid); err != nil {
		mue(w, 500, "помилка")
		return
	}
	if err = tx.Commit(ctx); err != nil {
		mue(w, 500, "помилка")
		return
	}
	restore = false
	if tomb != "" {
		if err = os.Remove(tomb); err != nil {
			fmt.Printf("music cleanup: %v\n", err)
		}
	}
	w.WriteHeader(http.StatusNoContent)
}

func muf(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if !mun(name) {
		http.NotFound(w, r)
		return
	}
	ctx, can := context.WithTimeout(r.Context(), 10*time.Second)
	defer can()
	var ex bool
	if err := db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.music WHERE failik=$1)", "/music-files/"+name).Scan(&ex); err != nil {
		http.Error(w, "помилка", 503)
		return
	}
	if !ex {
		http.NotFound(w, r)
		return
	}
	path := filepath.Join(mdr, name)
	fi, err := os.Lstat(path)
	if err != nil || !fi.Mode().IsRegular() {
		http.NotFound(w, r)
		return
	}
	f, err := os.Open(path)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	defer f.Close()
	if strings.HasSuffix(name, ".wav") {
		w.Header().Set("Content-Type", "audio/wav")
	} else {
		w.Header().Set("Content-Type", "audio/mpeg")
	}
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "public, max-age=0, must-revalidate")
	http.ServeContent(w, r, name, fi.ModTime(), f)
}

const mbd = mdr + "/.binary"

type Mbs struct {
	uid     int
	at      time.Time
	busy    bool
	size    int64
	got     []bool
	hashes  []string
	writing []bool
	active  int
	ready   bool
}

var mbmu sync.Mutex
var mbslots = map[string]*Mbs{}

func mbinit() error {
	if err := os.MkdirAll(mbd, 0700); err != nil {
		return err
	}
	fi, err := os.Lstat(mbd)
	if err != nil {
		return err
	}
	if !fi.IsDir() || fi.Mode()&os.ModeSymlink != 0 {
		return fmt.Errorf("invalid music staging directory")
	}
	ls, err := os.ReadDir(mbd)
	if err != nil {
		return err
	}
	for _, v := range ls {
		if mun(v.Name()) && strings.HasSuffix(v.Name(), ".mp3") && !v.IsDir() {
			if err = os.Remove(filepath.Join(mbd, v.Name())); err != nil {
				return err
			}
		}
	}
	return nil
}

func mbclean() {
	mbmu.Lock()
	defer mbmu.Unlock()
	for k, v := range mbslots {
		if !v.busy && time.Since(v.at) > 30*time.Minute {
			if err := os.Remove(filepath.Join(mbd, k+".mp3")); err == nil || os.IsNotExist(err) {
				delete(mbslots, k)
			}
		}
	}
}

func mbgc() {
	t := time.NewTicker(time.Minute)
	defer t.Stop()
	for range t.C {
		mbclean()
	}
}

func mba(w http.ResponseWriter, r *http.Request) int {
	s, err := st.Get(r, "s")
	uid := 0
	if err == nil {
		uid, _ = s.Values["uid"].(int)
	}
	if uid <= 0 {
		mue(w, 401, "увійди")
		return 0
	}
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		mue(w, 403, "запит з іншого сайту заборонено")
		return 0
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		u, er := url.Parse(origin)
		if er != nil || (u.Scheme != "http" && u.Scheme != "https") || !strings.EqualFold(u.Host, r.Host) || u.User != nil || (u.Path != "" && u.Path != "/") || u.RawQuery != "" || u.Fragment != "" {
			mue(w, 403, "запит з іншого сайту заборонено")
			return 0
		}
	}
	ctx, can := context.WithTimeout(r.Context(), 10*time.Second)
	defer can()
	var ex bool
	if err = db.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)", uid).Scan(&ex); err != nil {
		mue(w, 500, "помилка")
		return 0
	}
	if !ex {
		mue(w, 401, "увійди знову")
		return 0
	}
	return uid
}

func mbh(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost && r.URL.Query().Get("op") != "" {
		mch(w, r)
		return
	}
	if r.Method != http.MethodPost && r.Method != http.MethodDelete {
		w.Header().Set("Allow", "POST, DELETE")
		mue(w, 405, "метод не підтримується")
		return
	}
	uid := mba(w, r)
	if uid == 0 {
		return
	}
	if r.Method == http.MethodDelete {
		k := r.URL.Query().Get("token")
		if !mun(k + ".mp3") {
			mue(w, 400, "невірні дані запиту")
			return
		}
		mbmu.Lock()
		v := mbslots[k]
		if v != nil && v.uid != uid {
			mbmu.Unlock()
			mue(w, 404, "не знайдено")
			return
		}
		if v != nil && v.busy {
			mbmu.Unlock()
			mue(w, 409, "помилка")
			return
		}
		if v != nil {
			if err := os.Remove(filepath.Join(mbd, k+".mp3")); err != nil && !os.IsNotExist(err) {
				mbmu.Unlock()
				mue(w, 500, "помилка")
				return
			}
			delete(mbslots, k)
		}
		mbmu.Unlock()
		w.WriteHeader(http.StatusNoContent)
		return
	}
	ct, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || ct != "application/json" {
		mue(w, 415, "невірні дані запиту")
		return
	}
	if r.ContentLength > mjlimit {
		mue(w, 413, "макс 100 МБ")
		return
	}
	mbclean()
	var rnd [16]byte
	if _, err = rand.Read(rnd[:]); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	k := hex.EncodeToString(rnd[:])
	mbmu.Lock()
	n := 0
	for _, v := range mbslots {
		if v.uid == uid {
			n++
		}
	}
	if n >= 2 || len(mbslots) >= 8 {
		mbmu.Unlock()
		mue(w, 429, "помилка завантаження")
		return
	}
	if _, exists := mbslots[k]; exists {
		mbmu.Unlock()
		mue(w, 500, "помилка завантаження")
		return
	}
	mbslots[k] = &Mbs{uid: uid, at: time.Now(), busy: true}
	mbmu.Unlock()
	path := filepath.Join(mbd, k+".mp3")
	keep := false
	created := false
	defer func() {
		if !keep {
			mbmu.Lock()
			if !created {
				delete(mbslots, k)
			} else if er := os.Remove(path); er == nil || os.IsNotExist(er) {
				delete(mbslots, k)
			} else {
				mbslots[k].busy = false
			}
			mbmu.Unlock()
		}
	}()
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_EXCL, 0600)
	if err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	created = true
	defer f.Close()
	rc := http.NewResponseController(w)
	if er := rc.SetReadDeadline(time.Now().Add(10 * time.Minute)); er == nil {
		defer rc.SetReadDeadline(time.Time{})
	}
	r.Body = http.MaxBytesReader(w, r.Body, mjlimit)
	br := bufio.NewReaderSize(r.Body, 32768)
	if er := mjstart(br); er != nil {
		mue(w, 400, "невірні дані запиту")
		return
	}
	src := &Mjr{b: br}
	z, err := io.Copy(f, io.LimitReader(base64.NewDecoder(base64.StdEncoding.Strict(), src), mlm+1))
	if z > mlm {
		mue(w, 413, "макс 100 МБ")
		return
	}
	if err != nil || r.Context().Err() != nil {
		mue(w, 400, "помилка завантаження")
		return
	}
	tail, er := io.ReadAll(io.LimitReader(br, 1025))
	if er != nil || !src.end || len(tail) > 1024 || string(bytes.Trim(tail, " \t\r\n")) != "}" {
		mue(w, 400, "невірні дані запиту")
		return
	}
	if z == 0 || !mft(f, z, ".mp3") {
		mue(w, 400, "тільки MP3 або WAV")
		return
	}
	if err = f.Sync(); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	if err = f.Close(); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	mbmu.Lock()
	mbslots[k].busy = false
	keep = true
	mbmu.Unlock()
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"token": k})
}

func mbpub(w http.ResponseWriter, r *http.Request, uid int) {
	var a struct {
		Na string `json:"nazva"`
		Ge string `json:"genre"`
		Au string `json:"author"`
		Al string `json:"albom"`
		Yr *int   `json:"godvipuska"`
		Op string `json:"opis"`
		Up string `json:"upload"`
	}
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if err := d.Decode(&a); err != nil {
		mue(w, 400, "невірні дані запиту")
		return
	}
	var extra any
	if err := d.Decode(&extra); err != io.EOF {
		mue(w, 400, "невірні дані запиту")
		return
	}
	a.Na = strings.TrimSpace(a.Na)
	a.Au = strings.TrimSpace(a.Au)
	a.Al = strings.TrimSpace(a.Al)
	if a.Na == "" || a.Au == "" {
		mue(w, 400, "вкажи назву та виконавця")
		return
	}
	if !muv(a.Na, 160) || !muv(a.Au, 160) || !muv(a.Al, 160) || !muv(a.Op, 5000) || !mun(a.Up+".mp3") {
		mue(w, 400, "невірні дані запиту")
		return
	}
	valid := false
	for _, v := range strings.Fields("pop rock hiphop electronic house techno dnb dubstep trance ambient jazz blues soul funk disco rnb reggae country folk classical metal punk indie soundtrack") {
		if a.Ge == v {
			valid = true
			break
		}
	}
	if !valid {
		mue(w, 400, "невірні дані запиту")
		return
	}
	if a.Yr != nil && (*a.Yr < 1000 || *a.Yr > 9999) {
		mue(w, 400, "невірний рік випуску")
		return
	}
	mbmu.Lock()
	s := mbslots[a.Up]
	if s == nil || s.uid != uid || time.Since(s.at) > 30*time.Minute {
		mbmu.Unlock()
		mue(w, 404, "не знайдено")
		return
	}
	if s.got != nil && !s.ready {
		mbmu.Unlock()
		mue(w, 409, "помилка завантаження")
		return
	}
	if s.busy {
		mbmu.Unlock()
		mue(w, 409, "помилка")
		return
	}
	s.busy = true
	mbmu.Unlock()
	consumed := false
	path := filepath.Join(mbd, a.Up+".mp3")
	defer func() {
		mbmu.Lock()
		if consumed {
			if er := os.Remove(path); er == nil || os.IsNotExist(er) {
				delete(mbslots, a.Up)
			} else {
				s.busy = false
				s.at = time.Now().Add(-time.Hour)
			}
		} else {
			s.busy = false
		}
		mbmu.Unlock()
	}()
	fi, err := os.Lstat(path)
	if err != nil || !fi.Mode().IsRegular() || fi.Size() <= 0 || fi.Size() > mlm {
		mue(w, 500, "помилка завантаження")
		return
	}
	ctx, can := context.WithTimeout(r.Context(), 20*time.Second)
	defer can()
	tx, err := db.Begin(ctx)
	if err != nil {
		mue(w, 500, "помилка збереження")
		return
	}
	defer tx.Rollback(ctx)
	fl := "/music-files/" + a.Up + ".mp3"
	v, err := mus(tx.QueryRow(ctx, "INSERT INTO public.music(nazva,failik,genre,uploader,author,albom,godvipuska,opis) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING "+mqq, a.Na, fl, a.Ge, uid, a.Au, a.Al, a.Yr, a.Op))
	if err != nil {
		mue(w, 500, "помилка збереження")
		return
	}
	final := filepath.Join(mdr, a.Up+".mp3")
	if err = os.Link(path, final); err != nil {
		mue(w, 500, "помилка завантаження")
		return
	}
	keep := false
	defer func() {
		if !keep {
			if er := os.Remove(final); er != nil && !os.IsNotExist(er) {
				fmt.Printf("music binary cleanup: %v\n", er)
			}
		}
	}()
	if err = tx.Commit(ctx); err != nil {
		cx, cl := context.WithTimeout(context.Background(), 5*time.Second)
		var ex bool
		er := db.QueryRow(cx, "SELECT EXISTS(SELECT 1 FROM public.music WHERE id=$1 AND failik=$2)", v.Id, v.Fl).Scan(&ex)
		cl()
		keep = ex || er != nil
		consumed = keep
		fmt.Printf("music binary commit: %v\n", err)
		mue(w, 500, "помилка збереження")
		return
	}
	keep = true
	consumed = true
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(v)
}

const mjlimit int64 = ((mlm+2)/3)*4 + 1024

type Mjr struct {
	b   *bufio.Reader
	p   []byte
	end bool
}

func mjstart(b *bufio.Reader) error {
	n := 0
	next := func() (byte, error) {
		for {
			c, e := b.ReadByte()
			if e != nil {
				return 0, e
			}
			n++
			if n > 256 {
				return 0, errors.New("invalid JSON header")
			}
			if c != ' ' && c != '\t' && c != '\r' && c != '\n' {
				return c, nil
			}
		}
	}
	for _, want := range []byte{'{', '"'} {
		c, e := next()
		if e != nil {
			return e
		}
		if c != want {
			return errors.New("invalid JSON header")
		}
	}
	var key [5]byte
	if _, e := io.ReadFull(b, key[:]); e != nil {
		return e
	}
	if string(key[:]) != "data\"" {
		return errors.New("invalid JSON field")
	}
	for _, want := range []byte{':', '"'} {
		c, e := next()
		if e != nil {
			return e
		}
		if c != want {
			return errors.New("invalid JSON header")
		}
	}
	return nil
}

func (s *Mjr) Read(p []byte) (int, error) {
	if len(p) == 0 {
		return 0, nil
	}
	if len(s.p) == 0 {
		if s.end {
			return 0, io.EOF
		}
		b, e := s.b.ReadSlice('"')
		if e == nil {
			s.end = true
			b = b[:len(b)-1]
		} else if e != bufio.ErrBufferFull {
			if e == io.EOF {
				e = io.ErrUnexpectedEOF
			}
			return 0, e
		}
		for _, c := range b {
			if !(c >= 'A' && c <= 'Z') && !(c >= 'a' && c <= 'z') && !(c >= '0' && c <= '9') && c != '+' && c != '/' && c != '=' {
				return 0, errors.New("invalid base64 JSON string")
			}
		}
		s.p = b
		if len(s.p) == 0 && s.end {
			return 0, io.EOF
		}
	}
	n := copy(p, s.p)
	s.p = s.p[n:]
	return n, nil
}

const mcsize = 128 << 10

func mcjson(w http.ResponseWriter, r *http.Request, v any) bool {
	ct, _, er := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if er != nil || ct != "application/json" {
		mue(w, 415, "невірні дані запиту")
		return false
	}
	rc := http.NewResponseController(w)
	if er = rc.SetReadDeadline(time.Now().Add(45 * time.Second)); er == nil {
		defer rc.SetReadDeadline(time.Time{})
	}
	r.Body = http.MaxBytesReader(w, r.Body, 256<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if er = d.Decode(v); er != nil {
		mue(w, 400, "невірні дані запиту")
		return false
	}
	var extra any
	if er = d.Decode(&extra); er != io.EOF {
		mue(w, 400, "невірні дані запиту")
		return false
	}
	return true
}

func mcok(w http.ResponseWriter, st int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(st)
	json.NewEncoder(w).Encode(v)
}

func mch(w http.ResponseWriter, r *http.Request) {
	uid := mba(w, r)
	if uid == 0 {
		return
	}
	op := r.URL.Query().Get("op")
	if op == "start" {
		var a struct {
			Size int64 `json:"size"`
		}
		if !mcjson(w, r, &a) {
			return
		}
		if a.Size <= 0 || a.Size > mlm {
			mue(w, 413, "макс 100 МБ")
			return
		}
		mbclean()
		var rnd [16]byte
		if _, er := rand.Read(rnd[:]); er != nil {
			mue(w, 500, "помилка завантаження")
			return
		}
		k := hex.EncodeToString(rnd[:])
		n := int((a.Size + mcsize - 1) / mcsize)
		mbmu.Lock()
		count := 0
		for _, s := range mbslots {
			if s.uid == uid {
				count++
			}
		}
		if count >= 2 || len(mbslots) >= 8 {
			mbmu.Unlock()
			mue(w, 429, "помилка завантаження")
			return
		}
		if _, exists := mbslots[k]; exists {
			mbmu.Unlock()
			mue(w, 500, "помилка завантаження")
			return
		}
		s := &Mbs{uid: uid, at: time.Now(), busy: true, size: a.Size, got: make([]bool, n), hashes: make([]string, n), writing: make([]bool, n)}
		mbslots[k] = s
		mbmu.Unlock()
		path := filepath.Join(mbd, k+".mp3")
		f, er := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_EXCL, 0600)
		created := er == nil
		if er == nil {
			er = f.Truncate(a.Size)
			if ce := f.Close(); er == nil {
				er = ce
			}
		}
		if er != nil {
			mbmu.Lock()
			if !created {
				delete(mbslots, k)
			} else if e := os.Remove(path); e == nil || os.IsNotExist(e) {
				delete(mbslots, k)
			} else {
				s.busy = false
				s.at = time.Now().Add(-time.Hour)
			}
			mbmu.Unlock()
			mue(w, 500, "помилка завантаження")
			return
		}
		mbmu.Lock()
		s.busy = false
		mbmu.Unlock()
		mcok(w, 201, map[string]any{"token": k, "chunkSize": mcsize, "parts": n})
		return
	}
	k := r.URL.Query().Get("token")
	if !mun(k + ".mp3") {
		mue(w, 400, "невірні дані запиту")
		return
	}
	if op == "part" {
		i, er := strconv.Atoi(r.URL.Query().Get("index"))
		if er != nil || i < 0 {
			mue(w, 400, "невірні дані запиту")
			return
		}
		var a struct {
			Data string `json:"data"`
			Hash string `json:"sha256"`
		}
		if !mcjson(w, r, &a) {
			return
		}
		mbmu.Lock()
		s := mbslots[k]
		if s == nil || s.uid != uid || s.got == nil || time.Since(s.at) > 30*time.Minute {
			mbmu.Unlock()
			mue(w, 404, "не знайдено")
			return
		}
		if i >= len(s.got) {
			mbmu.Unlock()
			mue(w, 400, "невірні дані запиту")
			return
		}
		want := int64(mcsize)
		if rest := s.size - int64(i)*mcsize; rest < want {
			want = rest
		}
		if len(a.Data) != int((want+2)/3*4) || len(a.Hash) != 64 {
			mbmu.Unlock()
			mue(w, 400, "невірні дані запиту")
			return
		}
		if s.got[i] {
			same := s.hashes[i] == a.Hash
			mbmu.Unlock()
			if !same {
				mue(w, 409, "невірні дані запиту")
				return
			}
			mcok(w, 200, map[string]any{"index": i})
			return
		}
		if s.ready || (s.busy && s.active == 0) || s.writing[i] {
			mbmu.Unlock()
			mue(w, 409, "помилка завантаження")
			return
		}
		if s.active >= 2 {
			mbmu.Unlock()
			mue(w, 429, "помилка завантаження")
			return
		}
		s.active++
		s.writing[i] = true
		s.busy = true
		mbmu.Unlock()
		defer func() { mbmu.Lock(); s.active--; s.writing[i] = false; s.busy = s.active > 0; mbmu.Unlock() }()
		b, er := base64.StdEncoding.Strict().DecodeString(a.Data)
		if er != nil || int64(len(b)) != want {
			mue(w, 400, "невірні дані запиту")
			return
		}
		h := sha256.Sum256(b)
		if hex.EncodeToString(h[:]) != a.Hash {
			mue(w, 400, "невірні дані запиту")
			return
		}
		f, er := os.OpenFile(filepath.Join(mbd, k+".mp3"), os.O_WRONLY, 0)
		if er != nil {
			mue(w, 500, "помилка завантаження")
			return
		}
		n, er := f.WriteAt(b, int64(i)*mcsize)
		ce := f.Close()
		if er != nil || ce != nil || n != len(b) {
			mue(w, 500, "помилка завантаження")
			return
		}
		mbmu.Lock()
		s.got[i] = true
		s.hashes[i] = a.Hash
		s.at = time.Now()
		mbmu.Unlock()
		mcok(w, 200, map[string]any{"index": i})
		return
	}
	if op == "finish" {
		var a struct{}
		if !mcjson(w, r, &a) {
			return
		}
		mbmu.Lock()
		s := mbslots[k]
		if s == nil || s.uid != uid || s.got == nil || time.Since(s.at) > 30*time.Minute {
			mbmu.Unlock()
			mue(w, 404, "не знайдено")
			return
		}
		if s.busy {
			mbmu.Unlock()
			mue(w, 409, "помилка завантаження")
			return
		}
		for _, done := range s.got {
			if !done {
				mbmu.Unlock()
				mue(w, 409, "помилка завантаження")
				return
			}
		}
		if s.ready {
			mbmu.Unlock()
			mcok(w, 200, map[string]string{"token": k})
			return
		}
		s.busy = true
		mbmu.Unlock()
		defer func() { mbmu.Lock(); s.busy = false; mbmu.Unlock() }()
		f, er := os.OpenFile(filepath.Join(mbd, k+".mp3"), os.O_RDWR, 0)
		if er != nil {
			mue(w, 500, "помилка завантаження")
			return
		}
		defer f.Close()
		fi, er := f.Stat()
		if er != nil || !fi.Mode().IsRegular() || fi.Size() != s.size || !mft(f, s.size, ".mp3") {
			mue(w, 400, "тільки MP3 або WAV")
			return
		}
		if er = f.Sync(); er != nil {
			mue(w, 500, "помилка завантаження")
			return
		}
		mbmu.Lock()
		s.ready = true
		s.at = time.Now()
		mbmu.Unlock()
		mcok(w, 200, map[string]string{"token": k})
		return
	}
	mue(w, 400, "невірні дані запиту")
}

const vbd = "/opt/mriya/backend/video-files"
const vbmax = int64(268435456)
const vbformats = "mov,mp4,m4a,3gp,3g2,mj2,matroska,webm,avi,mpeg,mpegts,flv,asf,ogg,rm,nut,amv,wtv,vob,swf,mxf,nsv,ivf,bink,smk,roq,film_cpk,gxf,lxf"

var vbkey []byte
var vbgcat time.Time
var vbslots = make(chan struct{}, 2)
var vbmu sync.Mutex
var vbusers = map[int]bool{}
var vbjobs = map[int64]context.CancelFunc{}

type Vbq interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}
type Vbprobe struct {
	Streams []struct {
		Type        string `json:"codec_type"`
		Width       int    `json:"width"`
		Height      int    `json:"height"`
		Duration    string `json:"duration"`
		Disposition struct {
			Attached int `json:"attached_pic"`
		} `json:"disposition"`
	} `json:"streams"`
	Format struct {
		Duration string `json:"duration"`
	} `json:"format"`
}
type Vbcursor struct {
	S string
	Q string
	U int64
	A int
	I int64
	K int64
	T time.Time
}
type Vbbuf struct {
	bytes.Buffer
	N int
}

func (b *Vbbuf) Write(p []byte) (int, error) {
	if b.Len()+len(p) > b.N {
		return 0, io.ErrShortWrite
	}
	return b.Buffer.Write(p)
}
func vbe(w http.ResponseWriter, n int, c string) { vbj(w, n, map[string]string{"code": c}) }
func vbj(w http.ResponseWriter, n int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(n)
	json.NewEncoder(w).Encode(v)
}
func vbu(r *http.Request) int {
	s, e := st.Get(r, "s")
	if e != nil {
		return 0
	}
	u, _ := s.Values["uid"].(int)
	if u < 1 {
		return 0
	}
	return u
}
func vbsame(w http.ResponseWriter, r *http.Request) bool {
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		vbe(w, 403, "FORBIDDEN")
		return false
	}
	if o := r.Header.Get("Origin"); o != "" {
		u, e := url.Parse(o)
		if e != nil || (u.Scheme != "https" && u.Scheme != "http") || !strings.EqualFold(u.Host, r.Host) || u.User != nil || u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/") {
			vbe(w, 403, "FORBIDDEN")
			return false
		}
	}
	return true
}
func vbauth(w http.ResponseWriter, r *http.Request) (int, bool) {
	u := vbu(r)
	if u == 0 {
		vbe(w, 401, "AUTH")
		return 0, false
	}
	return u, vbsame(w, r)
}
func vbid(s string) (int64, error) {
	n, e := strconv.ParseInt(s, 10, 64)
	if e != nil || n < 1 || n > 9007199254740991 {
		return 0, errors.New("id")
	}
	return n, nil
}
func vbvalid(s string, n int) bool {
	return utf8.ValidString(s) && utf8.RuneCountInString(s) <= n && !strings.ContainsRune(s, 0)
}
func vbuuid(s string) bool {
	if len(s) != 36 || s[8] != '-' || s[13] != '-' || s[18] != '-' || s[23] != '-' || s[14] != '4' || !strings.ContainsRune("89abAB", rune(s[19])) {
		return false
	}
	_, e := hex.DecodeString(strings.ReplaceAll(s, "-", ""))
	return e == nil
}
func vbjson(w http.ResponseWriter, r *http.Request, v any) bool {
	ct, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if e != nil || ct != "application/json" {
		vbe(w, 415, "VALID")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 64<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if e = d.Decode(v); e != nil {
		vbe(w, 400, "VALID")
		return false
	}
	var x any
	if d.Decode(&x) != io.EOF {
		vbe(w, 400, "VALID")
		return false
	}
	return true
}
func vbrnd() (string, error) {
	var b [32]byte
	_, e := rand.Read(b[:])
	return hex.EncodeToString(b[:]), e
}
func vbmac(s string) []byte { h := hmac.New(sha256.New, vbkey); h.Write([]byte(s)); return h.Sum(nil) }
func vbviewer(w http.ResponseWriter, r *http.Request, u int) (string, error) {
	if u > 0 {
		return "u:" + strconv.Itoa(u), nil
	}
	seed := ""
	if c, e := r.Cookie("__Host-mriya_video"); e == nil {
		p := strings.Split(c.Value, ".")
		if len(p) == 2 && len(p[0]) == 64 && len(p[1]) == 64 {
			b, e := hex.DecodeString(p[0])
			sig, se := hex.DecodeString(p[1])
			if e == nil && se == nil && len(b) == 32 && hmac.Equal(sig, vbmac("cookie:"+p[0])) {
				seed = p[0]
			}
		}
	}
	if seed == "" {
		var e error
		seed, e = vbrnd()
		if e != nil {
			return "", e
		}
		http.SetCookie(w, &http.Cookie{Name: "__Host-mriya_video", Value: seed + "." + hex.EncodeToString(vbmac("cookie:"+seed)), Path: "/", MaxAge: 31536000, Secure: true, HttpOnly: true, SameSite: http.SameSiteLaxMode})
	}
	return "g:" + hex.EncodeToString(vbmac("guest:"+seed)), nil
}
func vbcencode(c Vbcursor) string {
	b, _ := json.Marshal(c)
	s := base64.RawURLEncoding.EncodeToString(b)
	return s + "." + hex.EncodeToString(vbmac("cursor:"+s))
}
func vbcdecode(s string, c *Vbcursor) bool {
	if len(s) > 2048 {
		return false
	}
	p := strings.Split(s, ".")
	if len(p) != 2 {
		return false
	}
	sig, e := hex.DecodeString(p[1])
	if e != nil || !hmac.Equal(sig, vbmac("cursor:"+p[0])) {
		return false
	}
	b, e := base64.RawURLEncoding.DecodeString(p[0])
	return e == nil && json.Unmarshal(b, c) == nil && c.I > 0 && c.I <= 9007199254740991 && c.K >= 0 && c.K <= 9007199254740991
}
func vbname(s, ext string) bool {
	if len(s) != 64+len(ext) || !strings.HasSuffix(s, ext) {
		return false
	}
	b, e := hex.DecodeString(s[:64])
	return e == nil && len(b) == 32 && s == strings.ToLower(s)
}
func vbremove(dir, n, ext string) {
	if vbname(n, ext) {
		os.Remove(filepath.Join(vbd, dir, n))
	}
}
func vbinit() error {
	for _, p := range []string{"src", "out", "previews", "tmp"} {
		if e := os.MkdirAll(filepath.Join(vbd, p), 0700); e != nil {
			return e
		}
	}
	p := filepath.Join(vbd, ".key")
	f, e := os.OpenFile(p, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0600)
	if e == nil {
		b := make([]byte, 32)
		if _, e = rand.Read(b); e == nil {
			_, e = f.Write(b)
		}
		if e == nil {
			e = f.Sync()
		}
		ce := f.Close()
		if e == nil {
			e = ce
		}
		if e != nil {
			os.Remove(p)
			return e
		}
	} else if !os.IsExist(e) {
		return e
	}
	vbkey, e = os.ReadFile(p)
	if e != nil || len(vbkey) != 32 {
		return errors.New("video key unavailable")
	}
	for _, p := range []string{"ffmpeg", "ffprobe", "prlimit"} {
		if _, e = exec.LookPath(p); e != nil {
			return e
		}
	}
	ctx, c := context.WithTimeout(context.Background(), 15*time.Second)
	defer c()
	var n int
	e = db.QueryRow(ctx, `SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('videos','video_comments') AND column_name='rev'`).Scan(&n)
	if e != nil || n != 2 {
		return errors.New("video SQL migration required")
	}
	return nil
}

const vbselect = `SELECT jsonb_build_object('id',v.id,'avtor_id',v.avtor_id,'nazva',v.nazva,'opis',v.opis,'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END,'created_at',v.created_at,'status',v.status,'failik',CASE WHEN v.status='ready' THEN '/api/video-files/'||v.failik ELSE '' END,'preview','/api/video-previews/'||v.preview,'duration',v.duration,'width',v.width,'height',v.height,'laiki',v.laiki,'dislaiki',v.dislaiki,'reposts',v.reposts,'shared',v.shared,'viewz',v.viewz,'skilki_commentariv',v.skilki_commentariv,'rev',v.rev,'my_r',COALESCE((SELECT reaction FROM public.video_reactions a WHERE a.vid=v.id AND a.uid=$1),0),'my_rp',EXISTS(SELECT 1 FROM public.video_reposts a WHERE a.vid=v.id AND a.uid=$1),'rp_users',COALESCE((SELECT jsonb_agg(z.j ORDER BY z.t DESC,z.id DESC) FROM (SELECT jsonb_build_object('id',u2.id,'username',u2.username,'galka',CASE WHEN COALESCE(g2.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g2.pic,'label',COALESCE(g2.label,'')) END) j,a.created_at t,u2.id FROM public.video_reposts a JOIN public.useri u2 ON u2.id=a.uid LEFT JOIN public.galki g2 ON g2.uid=u2.id WHERE a.vid=v.id ORDER BY a.created_at DESC,u2.id DESC LIMIT 30)z),'[]'::jsonb))`
const vbfrom = ` FROM public.videos v JOIN public.useri u ON u.id=v.avtor_id LEFT JOIN public.galki g ON g.uid=u.id `

func vbdto(ctx context.Context, q Vbq, u int, id int64) (json.RawMessage, error) {
	var b []byte
	e := q.QueryRow(ctx, vbselect+vbfrom+`WHERE v.id=$2 AND (v.status='ready' OR v.avtor_id=$1)`, u, id).Scan(&b)
	return json.RawMessage(b), e
}
func vblock(ctx context.Context, tx pgx.Tx, id int64, u int, own bool) int {
	var a int
	var s string
	e := tx.QueryRow(ctx, `SELECT avtor_id,status FROM public.videos WHERE id=$1 FOR UPDATE`, id).Scan(&a, &s)
	if e == pgx.ErrNoRows {
		return 404
	}
	if e != nil {
		return 500
	}
	if own && a != u {
		return 403
	}
	if !own && s != "ready" {
		return 404
	}
	return 0
}
func vbstatus(w http.ResponseWriter, n int) {
	c := "HTTP"
	if n == 404 {
		c = "NOT_FOUND"
	}
	if n == 403 {
		c = "FORBIDDEN"
	}
	vbe(w, n, c)
}
func vbfinish(w http.ResponseWriter, ctx context.Context, tx pgx.Tx, u int, id int64, n int, extra map[string]any) {
	v, e := vbdto(ctx, tx, u, id)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if extra == nil {
		vbj(w, n, v)
	} else {
		extra["video"] = v
		vbj(w, n, extra)
	}
}
func vbh(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		vblist(w, r)
	case "POST":
		if r.URL.Query().Get("op") != "" {
			vch(w, r)
		} else {
			vbup(w, r)
		}
	case "DELETE":
		vbdel(w, r)
	default:
		w.Header().Set("Allow", "GET, POST, DELETE")
		vbe(w, 405, "HTTP")
	}
}
func vblist(w http.ResponseWriter, r *http.Request) {
	u := vbu(r)
	if _, e := vbviewer(w, r, u); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	q := r.URL.Query()
	if s := q.Get("id"); s != "" {
		id, e := vbid(s)
		if e != nil {
			vbe(w, 400, "VALID")
			return
		}
		v, e := vbdto(ctx, db, u, id)
		if e == pgx.ErrNoRows {
			vbj(w, 200, map[string]any{"items": []any{}, "next": nil})
			return
		}
		if e != nil {
			vbe(w, 500, "HTTP")
			return
		}
		vbj(w, 200, map[string]any{"items": []json.RawMessage{v}, "next": nil})
		return
	}
	lim := 20
	if s := q.Get("limit"); s != "" {
		n, e := strconv.Atoi(s)
		if e != nil || n < 1 || n > 50 {
			vbe(w, 400, "VALID")
			return
		}
		lim = n
	}
	target := int64(0)
	if s := q.Get("uid"); s != "" {
		n, e := vbid(s)
		if e != nil {
			vbe(w, 400, "VALID")
			return
		}
		target = n
	}
	text := strings.TrimSpace(q.Get("q"))
	if !vbvalid(text, 200) {
		vbe(w, 400, "VALID")
		return
	}
	sort := q.Get("sort")
	if sort == "" {
		sort = "new"
	}
	col, asc := "v.created_at", false
	switch sort {
	case "new":
	case "old":
		asc = true
	case "likes":
		col = "v.laiki"
	case "dislikes":
		col = "v.dislaiki"
	case "reposts":
		col = "v.reposts"
	default:
		vbe(w, 400, "VALID")
		return
	}
	args := []any{u, target, text}
	where := `WHERE (v.status='ready' OR v.avtor_id=$1) AND ($2::bigint=0 OR v.avtor_id=$2 OR EXISTS(SELECT 1 FROM public.video_reposts a WHERE a.vid=v.id AND a.uid=$2)) AND ($3::text='' OR v.nazva ILIKE '%'||$3||'%' OR v.opis ILIKE '%'||$3||'%' OR u.username ILIKE '%'||$3||'%') `
	op, dir := "<", "DESC"
	if asc {
		op, dir = ">", "ASC"
	}
	if s := q.Get("cursor"); s != "" {
		var p Vbcursor
		if !vbcdecode(s, &p) || p.S != sort || p.Q != text || p.U != target || p.A != u || ((sort == "old" || sort == "new") && p.T.IsZero()) {
			vbe(w, 400, "VALID")
			return
		}
		var key any = p.K
		if sort == "old" || sort == "new" {
			key = p.T
		}
		args = append(args, key, p.I)
		where += fmt.Sprintf("AND (%s,v.id) %s ($4,$5) ", col, op)
	}
	args = append(args, lim+1)
	countCol := col
	if sort == "old" || sort == "new" {
		countCol = "0::bigint"
	}
	query := vbselect + `,v.created_at,` + countCol + `,v.id` + vbfrom + where + `ORDER BY ` + col + ` ` + dir + `,v.id ` + dir + fmt.Sprintf(" LIMIT $%d", len(args))
	rows, e := db.Query(ctx, query, args...)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer rows.Close()
	out := []json.RawMessage{}
	var last Vbcursor
	var next any
	for rows.Next() {
		var b []byte
		var t time.Time
		var k, id int64
		if e = rows.Scan(&b, &t, &k, &id); e != nil {
			vbe(w, 500, "HTTP")
			return
		}
		if len(out) == lim {
			next = vbcencode(last)
			break
		}
		out = append(out, json.RawMessage(b))
		last = Vbcursor{S: sort, Q: text, U: target, A: u, I: id, K: k, T: t}
	}
	if rows.Err() != nil {
		vbe(w, 500, "HTTP")
		return
	}
	vbj(w, 200, map[string]any{"items": out, "next": next})
}
func vbcommand(ctx context.Context, bin string, args ...string) ([]byte, error) {
	params := append([]string{"--as=2147483648", "--cpu=7200", "--nofile=64", "--", bin}, args...)
	cmd := exec.CommandContext(ctx, "prlimit", params...)
	out := &Vbbuf{N: 1 << 20}
	errout := &Vbbuf{N: 16 << 10}
	cmd.Stdout = out
	cmd.Stderr = errout
	e := cmd.Run()
	return out.Bytes(), e
}
func vbprobe(ctx context.Context, p, formats string) (Vbprobe, error) {
	b, e := vbcommand(ctx, "ffprobe", "-v", "error", "-max_alloc", "134217728", "-protocol_whitelist", "file,pipe", "-format_whitelist", formats, "-show_entries", "stream=codec_type,width,height,duration:stream_disposition=attached_pic:format=duration", "-of", "json", p)
	var v Vbprobe
	if e == nil {
		e = json.Unmarshal(b, &v)
	}
	return v, e
}
func vbmeta(p Vbprobe) (int, int, float64) {
	d, _ := strconv.ParseFloat(p.Format.Duration, 64)
	for _, s := range p.Streams {
		if s.Type == "video" && s.Disposition.Attached == 0 {
			if d <= 0 {
				d, _ = strconv.ParseFloat(s.Duration, 64)
			}
			return s.Width, s.Height, d
		}
	}
	return 0, 0, 0
}
func vbup(w http.ResponseWriter, r *http.Request) {
	u, ok := vbauth(w, r)
	if !ok {
		return
	}
	key := r.Header.Get("Idempotency-Key")
	if !vbuuid(key) {
		vbe(w, 400, "VALID")
		return
	}
	select {
	case vbslots <- struct{}{}:
		defer func() { <-vbslots }()
	default:
		vbe(w, 429, "HTTP")
		return
	}
	vbmu.Lock()
	busy := vbusers[u]
	if !busy {
		vbusers[u] = true
	}
	vbmu.Unlock()
	if busy {
		vbe(w, 429, "HTTP")
		return
	}
	defer func() { vbmu.Lock(); delete(vbusers, u); vbmu.Unlock() }()
	var disk syscall.Statfs_t
	if syscall.Statfs(vbd, &disk) != nil || uint64(disk.Bavail)*uint64(disk.Bsize) < 512<<20 {
		vbe(w, 507, "HTTP")
		return
	}
	rc := http.NewResponseController(w)
	if rc.SetReadDeadline(time.Now().Add(20*time.Minute)) == nil {
		defer rc.SetReadDeadline(time.Time{})
	}
	r.Body = http.MaxBytesReader(w, r.Body, 300<<20)
	mr, e := r.MultipartReader()
	if e != nil {
		vbe(w, 400, "VALID")
		return
	}
	fields := map[string]string{}
	files := map[string]string{}
	sizes := map[string]int64{}
	original := ""
	defer func() {
		for _, p := range files {
			os.Remove(p)
		}
	}()
	parts := 0
	for {
		p, er := mr.NextPart()
		if er == io.EOF {
			break
		}
		if er != nil {
			var mx *http.MaxBytesError
			if errors.As(er, &mx) {
				vbe(w, 413, "SIZE")
			} else {
				vbe(w, 400, "VALID")
			}
			return
		}
		parts++
		if parts > 4 {
			vbe(w, 400, "VALID")
			return
		}
		k := p.FormName()
		if k == "video" || k == "preview" {
			if _, yes := files[k]; yes || p.FileName() == "" {
				vbe(w, 400, "VALID")
				return
			}
			lim := vbmax
			if k == "preview" {
				lim = 20 << 20
			}
			f, er := os.CreateTemp(filepath.Join(vbd, "tmp"), "upload-")
			if er != nil {
				vbe(w, 500, "HTTP")
				return
			}
			files[k] = f.Name()
			n, er := io.Copy(f, io.LimitReader(p, lim+1))
			if er == nil {
				er = f.Sync()
			}
			ce := f.Close()
			if n > lim {
				code := "SIZE"
				if k == "preview" {
					code = "PREVIEW_SIZE"
				}
				vbe(w, 413, code)
				return
			}
			if er != nil || ce != nil || n == 0 {
				vbe(w, 400, "VALID")
				return
			}
			sizes[k] = n
			if k == "video" {
				original = p.FileName()
				if !vbvalid(original, 255) {
					vbe(w, 400, "VALID")
					return
				}
			}
		} else {
			if (k != "nazva" && k != "opis") || p.FileName() != "" {
				vbe(w, 400, "VALID")
				return
			}
			if _, yes := fields[k]; yes {
				vbe(w, 400, "VALID")
				return
			}
			b, er := io.ReadAll(io.LimitReader(p, 20001))
			if er != nil || len(b) > 20000 {
				vbe(w, 400, "VALID")
				return
			}
			fields[k] = string(b)
		}
		p.Close()
	}
	title := strings.TrimSpace(fields["nazva"])
	desc := fields["opis"]
	if title == "" || !vbvalid(title, 160) || !vbvalid(desc, 5000) || files["video"] == "" || files["preview"] == "" {
		vbe(w, 400, "VALID")
		return
	}
	ctx, can := context.WithTimeout(r.Context(), 2*time.Minute)
	defer can()
	tx, e := db.Begin(ctx)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer tx.Rollback(context.Background())
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(741923,$1)`, u); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	var old int64
	var equal bool
	e = tx.QueryRow(ctx, `SELECT id,nazva=$3 AND opis=$4 AND source_size=$5 AND original_name=$6 FROM public.videos WHERE avtor_id=$1 AND client_key=$2::uuid`, u, key, title, desc, sizes["video"], original).Scan(&old, &equal)
	if e == nil {
		if !equal {
			vbe(w, 409, "VALID")
			return
		}
		vbfinish(w, ctx, tx, u, old, 200, nil)
		return
	}
	if e != pgx.ErrNoRows {
		vbe(w, 500, "HTTP")
		return
	}
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(741923,0)`); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	var own, total, pending int64
	e = tx.QueryRow(ctx, `SELECT COALESCE(sum(source_size+preview_size+video_size+CASE WHEN status='processing' THEN 1073741824 ELSE 0 END) FILTER(WHERE avtor_id=$1),0)::bigint,COALESCE(sum(source_size+preview_size+video_size+CASE WHEN status='processing' THEN 1073741824 ELSE 0 END),0)::bigint,count(*) FILTER(WHERE status='processing') FROM public.videos`, u).Scan(&own, &total, &pending)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if own+sizes["video"]+sizes["preview"]+(1<<30) > 3<<30 || total+sizes["video"]+sizes["preview"]+(1<<30) > 20<<30 || pending >= 16 {
		vbe(w, 429, "HTTP")
		return
	}
	cx, cc := context.WithTimeout(ctx, 30*time.Second)
	probe, er := vbprobe(cx, files["video"], vbformats)
	cc()
	width, height, duration := vbmeta(probe)
	if er != nil || width < 1 || height < 1 || width > 8192 || height > 8192 || int64(width)*int64(height) > 33554432 || math.IsNaN(duration) || math.IsInf(duration, 0) || duration <= 0 || duration > 86400 {
		vbe(w, 400, "MEDIA")
		return
	}
	head := make([]byte, 32)
	f, er := os.Open(files["preview"])
	if er == nil {
		_, er = io.ReadFull(f, head)
		f.Close()
	}
	if er != nil || !(bytes.Equal(head[:8], []byte{137, 80, 78, 71, 13, 10, 26, 10}) || (string(head[:4]) == "RIFF" && string(head[8:12]) == "WEBP")) {
		vbe(w, 400, "PREVIEW")
		return
	}
	cx, cc = context.WithTimeout(ctx, 20*time.Second)
	pr, er := vbprobe(cx, files["preview"], "png_pipe,webp_pipe")
	cc()
	pw, ph, _ := vbmeta(pr)
	if er != nil || pw < 1 || ph < 1 || pw > 1920 || ph > 1080 {
		vbe(w, 400, "PREVIEW")
		return
	}
	name, e := vbrnd()
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	src, out, prev := name+".src", name+".mp4", name+".webp"
	pp := filepath.Join(vbd, "previews", prev)
	sp := filepath.Join(vbd, "src", src)
	keep := false
	defer func() {
		if !keep {
			os.Remove(pp)
			os.Remove(sp)
		}
	}()
	cx, cc = context.WithTimeout(ctx, 30*time.Second)
	_, er = vbcommand(cx, "ffmpeg", "-nostdin", "-v", "error", "-max_alloc", "134217728", "-protocol_whitelist", "file,pipe", "-format_whitelist", "png_pipe,webp_pipe", "-threads", "1", "-i", files["preview"], "-map", "0:v:0", "-frames:v", "1", "-map_metadata", "-1", "-c:v", "libwebp", "-quality", "82", "-threads", "1", "-y", pp)
	cc()
	if er != nil {
		vbe(w, 400, "PREVIEW")
		return
	}
	fi, er := os.Stat(pp)
	if er != nil || fi.Size() < 1 || fi.Size() > 20<<20 {
		vbe(w, 400, "PREVIEW")
		return
	}
	if er = os.Rename(files["video"], sp); er != nil {
		vbe(w, 500, "HTTP")
		return
	}
	var id int64
	e = tx.QueryRow(ctx, `INSERT INTO public.videos(avtor_id,client_key,nazva,opis,source,original_name,source_size,source_mime,failik,preview,preview_size,preview_width,preview_height) VALUES($1,$2::uuid,$3,$4,$5,$6,$7,'application/octet-stream',$8,$9,$10,$11,$12) RETURNING id`, u, key, title, desc, src, original, sizes["video"], out, prev, fi.Size(), pw, ph).Scan(&id)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	v, e := vbdto(ctx, tx, u, id)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		cx, cc = context.WithTimeout(context.Background(), 5*time.Second)
		var ex bool
		er = db.QueryRow(cx, `SELECT EXISTS(SELECT 1 FROM public.videos WHERE avtor_id=$1 AND client_key=$2::uuid)`, u, key).Scan(&ex)
		cc()
		keep = ex || er != nil
		vbe(w, 500, "HTTP")
		return
	}
	keep = true
	vbj(w, 201, v)
}
func vbdel(w http.ResponseWriter, r *http.Request) {
	u, ok := vbauth(w, r)
	if !ok {
		return
	}
	id, e := vbid(r.URL.Query().Get("id"))
	if e != nil {
		vbe(w, 400, "VALID")
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	tx, e := db.Begin(ctx)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer tx.Rollback(context.Background())
	if n := vblock(ctx, tx, id, u, true); n != 0 {
		vbstatus(w, n)
		return
	}
	var src, out, prev string
	if e = tx.QueryRow(ctx, `DELETE FROM public.videos WHERE id=$1 RETURNING source,failik,preview`, id).Scan(&src, &out, &prev); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	vbmu.Lock()
	if can := vbjobs[id]; can != nil {
		can()
	}
	vbmu.Unlock()
	vbremove("src", src, ".src")
	vbremove("out", out, ".mp4")
	vbremove("previews", prev, ".webp")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(204)
}
func vbfile(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	preview := strings.HasPrefix(r.URL.Path, "/api/video-previews/")
	dir, ext, typ := "out", ".mp4", "video/mp4"
	if preview {
		dir, ext, typ = "previews", ".webp", "image/webp"
	}
	if !vbname(name, ext) {
		http.NotFound(w, r)
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 10*time.Second)
	defer c()
	var ex bool
	query := `SELECT EXISTS(SELECT 1 FROM public.videos WHERE failik=$1 AND status='ready')`
	args := []any{name}
	if preview {
		query = `SELECT EXISTS(SELECT 1 FROM public.videos WHERE preview=$1 AND (status='ready' OR avtor_id=$2))`
		args = append(args, vbu(r))
	}
	if e := db.QueryRow(ctx, query, args...).Scan(&ex); e != nil {
		vbe(w, 503, "HTTP")
		return
	}
	if !ex {
		http.NotFound(w, r)
		return
	}
	p := filepath.Join(vbd, dir, name)
	fi, e := os.Lstat(p)
	if e != nil || !fi.Mode().IsRegular() {
		http.NotFound(w, r)
		return
	}
	f, e := os.Open(p)
	if e != nil {
		http.NotFound(w, r)
		return
	}
	defer f.Close()
	w.Header().Set("Content-Type", typ)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "private, max-age=0, must-revalidate")
	http.ServeContent(w, r, name, fi.ModTime(), f)
}
func vbwatch(w http.ResponseWriter, r *http.Request) {
	if !vbsame(w, r) {
		return
	}
	var p struct {
		Id int64 `json:"id"`
	}
	if !vbjson(w, r, &p) {
		return
	}
	if p.Id < 1 || p.Id > 9007199254740991 {
		vbe(w, 400, "VALID")
		return
	}
	u := vbu(r)
	viewer, e := vbviewer(w, r, u)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	tx, e := db.Begin(ctx)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer tx.Rollback(context.Background())
	if n := vblock(ctx, tx, p.Id, u, false); n != 0 {
		vbstatus(w, n)
		return
	}
	h := sha256.Sum256([]byte(viewer))
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(741925,$1)`, int32(binary.BigEndian.Uint32(h[:4]))); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	var recent, active int
	e = tx.QueryRow(ctx, `SELECT count(*) FILTER(WHERE started_at>NOW()-interval '1 minute'),count(*) FILTER(WHERE NOT finished AND expires_at>NOW()) FROM public.video_watch_sessions WHERE viewer_key=$1 AND expires_at>NOW()-interval '1 minute'`, viewer).Scan(&recent, &active)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if recent >= 12 || active >= 60 {
		vbe(w, 429, "HTTP")
		return
	}
	token, e := vbrnd()
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	th := sha256.Sum256([]byte(token))
	var user any
	if u > 0 {
		user = u
	}
	if _, e = tx.Exec(ctx, `INSERT INTO public.video_watch_sessions(token_hash,vid,viewer_key,uid,started_at,expires_at) VALUES($1,$2,$3,$4,clock_timestamp(),clock_timestamp()+interval '30 minutes')`, hex.EncodeToString(th[:]), p.Id, viewer, user); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	vbj(w, 200, map[string]string{"token": token})
}
func vbact(w http.ResponseWriter, r *http.Request) {
	if !vbsame(w, r) {
		return
	}
	var p struct {
		Id      int64  `json:"id"`
		Act     string `json:"act"`
		Token   string `json:"token"`
		Watched int    `json:"watched_ms"`
	}
	if !vbjson(w, r, &p) {
		return
	}
	if p.Id < 1 || p.Id > 9007199254740991 {
		vbe(w, 400, "VALID")
		return
	}
	u := vbu(r)
	switch p.Act {
	case "like", "dislike", "repost":
		if u == 0 {
			vbe(w, 401, "AUTH")
			return
		}
	case "view", "share":
	default:
		vbe(w, 400, "VALID")
		return
	}
	viewer, e := vbviewer(w, r, u)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	tx, e := db.Begin(ctx)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer tx.Rollback(context.Background())
	if n := vblock(ctx, tx, p.Id, u, false); n != 0 {
		vbstatus(w, n)
		return
	}
	switch p.Act {
	case "like", "dislike":
		reaction := 1
		if p.Act == "dislike" {
			reaction = -1
		}
		var old int
		e = tx.QueryRow(ctx, `SELECT reaction FROM public.video_reactions WHERE vid=$1 AND uid=$2`, p.Id, u).Scan(&old)
		if e != nil && e != pgx.ErrNoRows {
			vbe(w, 500, "HTTP")
			return
		}
		if old == reaction {
			_, e = tx.Exec(ctx, `DELETE FROM public.video_reactions WHERE vid=$1 AND uid=$2`, p.Id, u)
		} else {
			_, e = tx.Exec(ctx, `INSERT INTO public.video_reactions(vid,uid,reaction) VALUES($1,$2,$3) ON CONFLICT(vid,uid) DO UPDATE SET reaction=EXCLUDED.reaction`, p.Id, u, reaction)
		}
	case "repost":
		var n int64
		tag, er := tx.Exec(ctx, `DELETE FROM public.video_reposts WHERE vid=$1 AND uid=$2`, p.Id, u)
		e = er
		if e == nil {
			n = tag.RowsAffected()
			if n == 0 {
				_, e = tx.Exec(ctx, `INSERT INTO public.video_reposts(vid,uid) VALUES($1,$2)`, p.Id, u)
			}
		}
	case "share":
		var user any
		if u > 0 {
			user = u
		}
		_, e = tx.Exec(ctx, `INSERT INTO public.video_shares(vid,viewer_key,uid) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, p.Id, viewer, user)
	case "view":
		if len(p.Token) != 64 || p.Watched < 1000 || p.Watched > 86400000 {
			vbe(w, 400, "VALID")
			return
		}
		if _, er := hex.DecodeString(p.Token); er != nil {
			vbe(w, 400, "VALID")
			return
		}
		h := sha256.Sum256([]byte(p.Token))
		var valid, aged, finished bool
		e = tx.QueryRow(ctx, `SELECT expires_at>clock_timestamp(),started_at<=clock_timestamp()-interval '1 second',finished FROM public.video_watch_sessions WHERE token_hash=$1 AND vid=$2 AND viewer_key=$3 FOR UPDATE`, hex.EncodeToString(h[:]), p.Id, viewer).Scan(&valid, &aged, &finished)
		if e == pgx.ErrNoRows || e == nil && !valid && !finished {
			vbe(w, 410, "WATCH_EXPIRED")
			return
		}
		if e != nil {
			vbe(w, 500, "HTTP")
			return
		}
		if !aged {
			vbe(w, 400, "VALID")
			return
		}
		var user any
		if u > 0 {
			user = u
		}
		_, e = tx.Exec(ctx, `INSERT INTO public.video_views(vid,viewer_key,uid,watched_ms) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING`, p.Id, viewer, user, p.Watched)
		if e == nil {
			_, e = tx.Exec(ctx, `UPDATE public.video_watch_sessions SET finished=TRUE WHERE token_hash=$1`, hex.EncodeToString(h[:]))
		}
	}
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	vbfinish(w, ctx, tx, u, p.Id, 200, nil)
}

const vbcselect = `SELECT jsonb_build_object('id',c.id,'vid',c.vid,'avtor_id',c.avtor_id,'username',u.username,'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END,'text',c.text,'parent_id',c.parent_id,'parent_username',pu.username,'created_at',c.created_at,'updated_at',c.updated_at,'rev',c.rev)`
const vbcfrom = ` FROM public.video_comments c JOIN public.useri u ON u.id=c.avtor_id LEFT JOIN public.galki g ON g.uid=u.id LEFT JOIN public.video_comments p ON p.id=c.parent_id LEFT JOIN public.useri pu ON pu.id=p.avtor_id `

func vbch(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		vbclist(w, r)
		return
	}
	u, ok := vbauth(w, r)
	if !ok {
		return
	}
	if r.Method != "POST" && r.Method != "PUT" && r.Method != "DELETE" {
		w.Header().Set("Allow", "GET, POST, PUT, DELETE")
		vbe(w, 405, "HTTP")
		return
	}
	var p struct {
		Id     int64  `json:"id"`
		Vid    int64  `json:"vid"`
		Text   string `json:"text"`
		Parent *int64 `json:"parent_id"`
	}
	var e error
	if r.Method == "DELETE" {
		p.Id, e = vbid(r.URL.Query().Get("id"))
		if e != nil {
			vbe(w, 400, "VALID")
			return
		}
	} else if !vbjson(w, r, &p) {
		return
	}
	if r.Method != "DELETE" {
		if strings.TrimSpace(p.Text) == "" || !vbvalid(p.Text, 5000) {
			vbe(w, 400, "VALID")
			return
		}
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	tx, e := db.Begin(ctx)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer tx.Rollback(context.Background())
	if r.Method == "POST" {
		if p.Vid < 1 || p.Vid > 9007199254740991 || (p.Parent != nil && (*p.Parent < 1 || *p.Parent > 9007199254740991)) || !vbuuid(r.Header.Get("Idempotency-Key")) {
			vbe(w, 400, "VALID")
			return
		}
	} else {
		if p.Id < 1 || p.Id > 9007199254740991 {
			vbe(w, 400, "VALID")
			return
		}
		e = tx.QueryRow(ctx, `SELECT vid FROM public.video_comments WHERE id=$1`, p.Id).Scan(&p.Vid)
		if e == pgx.ErrNoRows {
			vbe(w, 404, "NOT_FOUND")
			return
		}
		if e != nil {
			vbe(w, 500, "HTTP")
			return
		}
	}
	if n := vblock(ctx, tx, p.Vid, u, false); n != 0 {
		vbstatus(w, n)
		return
	}
	extra := map[string]any{}
	status := 200
	if r.Method == "POST" {
		var same bool
		e = tx.QueryRow(ctx, `SELECT id,vid=$3 AND text=$4 AND parent_id IS NOT DISTINCT FROM $5::bigint FROM public.video_comments WHERE avtor_id=$1 AND client_key=$2::uuid`, u, r.Header.Get("Idempotency-Key"), p.Vid, p.Text, p.Parent).Scan(&p.Id, &same)
		if e == nil {
			if !same {
				vbe(w, 409, "VALID")
				return
			}
		} else if e != pgx.ErrNoRows {
			vbe(w, 500, "HTTP")
			return
		} else {
			if p.Parent != nil {
				var depth int
				e = tx.QueryRow(ctx, `WITH RECURSIVE t AS(SELECT id,parent_id FROM public.video_comments WHERE id=$1 AND vid=$2 UNION ALL SELECT p.id,p.parent_id FROM public.video_comments p JOIN t ON p.id=t.parent_id) SELECT count(*) FROM t`, *p.Parent, p.Vid).Scan(&depth)
				if e != nil {
					vbe(w, 500, "HTTP")
					return
				}
				if depth < 1 || depth >= 16 {
					vbe(w, 400, "VALID")
					return
				}
			}
			e = tx.QueryRow(ctx, `INSERT INTO public.video_comments(vid,avtor_id,client_key,parent_id,text) VALUES($1,$2,$3::uuid,$4,$5) RETURNING id`, p.Vid, u, r.Header.Get("Idempotency-Key"), p.Parent, p.Text).Scan(&p.Id)
			if e != nil {
				vbe(w, 500, "HTTP")
				return
			}
			status = 201
		}
	} else {
		var owner int
		e = tx.QueryRow(ctx, `SELECT avtor_id FROM public.video_comments WHERE id=$1 FOR UPDATE`, p.Id).Scan(&owner)
		if e == pgx.ErrNoRows {
			vbe(w, 404, "NOT_FOUND")
			return
		}
		if e != nil {
			vbe(w, 500, "HTTP")
			return
		}
		if owner != u {
			vbe(w, 403, "FORBIDDEN")
			return
		}
		if r.Method == "PUT" {
			_, e = tx.Exec(ctx, `UPDATE public.video_comments SET text=$2 WHERE id=$1`, p.Id, p.Text)
			if e != nil {
				vbe(w, 500, "HTTP")
				return
			}
		} else {
			var ids []int64
			e = tx.QueryRow(ctx, `WITH RECURSIVE t AS(SELECT id FROM public.video_comments WHERE id=$1 UNION ALL SELECT c.id FROM public.video_comments c JOIN t ON c.parent_id=t.id) SELECT array_agg(id ORDER BY id) FROM t`, p.Id).Scan(&ids)
			if e != nil {
				vbe(w, 500, "HTTP")
				return
			}
			if _, e = tx.Exec(ctx, `DELETE FROM public.video_comments WHERE id=$1`, p.Id); e != nil {
				vbe(w, 500, "HTTP")
				return
			}
			extra["deleted"] = ids
			vbfinish(w, ctx, tx, u, p.Vid, 200, extra)
			return
		}
	}
	var b []byte
	if e = tx.QueryRow(ctx, vbcselect+vbcfrom+`WHERE c.id=$1`, p.Id).Scan(&b); e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	extra["comment"] = json.RawMessage(b)
	vbfinish(w, ctx, tx, u, p.Vid, status, extra)
}
func vbclist(w http.ResponseWriter, r *http.Request) {
	id, e := vbid(r.URL.Query().Get("vid"))
	if e != nil {
		vbe(w, 400, "VALID")
		return
	}
	lim := 40
	if s := r.URL.Query().Get("limit"); s != "" {
		lim, e = strconv.Atoi(s)
		if e != nil || lim < 1 || lim > 100 {
			vbe(w, 400, "VALID")
			return
		}
	}
	u := vbu(r)
	after := int64(0)
	if s := r.URL.Query().Get("cursor"); s != "" {
		var c Vbcursor
		if !vbcdecode(s, &c) || c.S != "comments" || c.U != id || c.A != u {
			vbe(w, 400, "VALID")
			return
		}
		after = c.I
	}
	ctx, c := context.WithTimeout(r.Context(), 15*time.Second)
	defer c()
	var ex bool
	e = db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM public.videos WHERE id=$1 AND (status='ready' OR avtor_id=$2))`, id, u).Scan(&ex)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if !ex {
		vbe(w, 404, "NOT_FOUND")
		return
	}
	rows, e := db.Query(ctx, vbcselect+`,c.id`+vbcfrom+`WHERE c.vid=$1 AND c.id>$2 ORDER BY c.id LIMIT $3`, id, after, lim+1)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	defer rows.Close()
	out := []json.RawMessage{}
	var last int64
	var next any
	for rows.Next() {
		var b []byte
		var n int64
		if e = rows.Scan(&b, &n); e != nil {
			vbe(w, 500, "HTTP")
			return
		}
		if len(out) == lim {
			next = vbcencode(Vbcursor{S: "comments", U: id, A: u, I: last})
			break
		}
		out = append(out, json.RawMessage(b))
		last = n
	}
	if rows.Err() != nil {
		vbe(w, 500, "HTTP")
		return
	}
	vbj(w, 200, map[string]any{"items": out, "next": next})
}
func vbwork() {
	for {
		vcgc()
		vbjob()
		time.Sleep(3 * time.Second)
	}
}
func vbjob() {
	ctx, c := context.WithTimeout(context.Background(), 2*time.Hour)
	defer c()
	conn, e := db.Acquire(ctx)
	if e != nil {
		return
	}
	defer conn.Release()
	var locked bool
	if e = conn.QueryRow(ctx, `SELECT pg_try_advisory_lock(741924,1)`).Scan(&locked); e != nil || !locked {
		return
	}
	defer func() {
		cc, cl := context.WithTimeout(context.Background(), 5*time.Second)
		defer cl()
		if _, er := conn.Exec(cc, `SELECT pg_advisory_unlock(741924,1)`); er != nil {
			conn.Conn().Close(cc)
		}
	}()
	var id int64
	var src, out string
	var duration float64
	e = conn.QueryRow(ctx, `SELECT id,source,failik FROM public.videos WHERE status='processing' ORDER BY id LIMIT 1`).Scan(&id, &src, &out)
	if e != nil {
		if e == pgx.ErrNoRows {
			vbgc(ctx)
		}
		return
	}
	if !vbname(src, ".src") || !vbname(out, ".mp4") {
		conn.Exec(ctx, `UPDATE public.videos SET status='failed',error='MEDIA' WHERE id=$1`, id)
		return
	}
	vbmu.Lock()
	vbjobs[id] = c
	vbmu.Unlock()
	defer func() { vbmu.Lock(); delete(vbjobs, id); vbmu.Unlock() }()
	var ex bool
	if e = conn.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM public.videos WHERE id=$1 AND status='processing')`, id).Scan(&ex); e != nil || !ex {
		return
	}
	source := filepath.Join(vbd, "src", src)
	dest := filepath.Join(vbd, "out", out)
	tmp := dest + ".part"
	os.Remove(tmp)
	defer os.Remove(tmp)
	probe, e := vbprobe(ctx, source, vbformats)
	_, _, duration = vbmeta(probe)
	if e == nil {
		_, e = vbcommand(ctx, "ffmpeg", "-nostdin", "-v", "error", "-max_alloc", "134217728", "-protocol_whitelist", "file,pipe", "-format_whitelist", vbformats, "-threads", "2", "-i", source, "-map", "0:V:0", "-map", "0:a:0?", "-sn", "-dn", "-map_metadata", "-1", "-map_chapters", "-1", "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1", "-filter_threads", "1", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-threads", "2", "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-movflags", "+faststart", "-max_muxing_queue_size", "1024", "-fs", "1073741824", "-f", "mp4", "-y", tmp)
	}
	var width, height int
	var d float64
	var fi os.FileInfo
	if e == nil {
		probe, e = vbprobe(ctx, tmp, vbformats)
		width, height, d = vbmeta(probe)
		if e == nil && (d <= 0 || math.IsNaN(d) || math.IsInf(d, 0) || width < 1 || height < 1 || d+math.Max(1, duration*0.02) < duration) {
			e = errors.New("incomplete video")
		}
	}
	if e == nil {
		fi, e = os.Stat(tmp)
		if e == nil && (fi.Size() < 1 || fi.Size() > 1<<30) {
			e = errors.New("output size")
		}
	}
	if e == nil {
		e = os.Rename(tmp, dest)
	}
	cc, cl := context.WithTimeout(context.Background(), 15*time.Second)
	defer cl()
	if e != nil {
		conn.Exec(cc, `UPDATE public.videos SET status='failed',error='MEDIA' WHERE id=$1 AND status='processing'`, id)
		fmt.Printf("video %d: conversion failed\n", id)
		return
	}
	tag, er := conn.Exec(cc, `UPDATE public.videos SET status='ready',error='',duration=$2,width=$3,height=$4,video_size=$5 WHERE id=$1 AND status='processing'`, id, d, width, height, fi.Size())
	if er != nil || tag.RowsAffected() == 0 {
		var registered bool
		qe := conn.QueryRow(cc, `SELECT EXISTS(SELECT 1 FROM public.videos WHERE id=$1 AND status='ready' AND failik=$2)`, id, out).Scan(&registered)
		if qe == nil && !registered {
			os.Remove(dest)
		}
	}
}
func vbgc(ctx context.Context) {
	if time.Since(vbgcat) < 10*time.Minute {
		return
	}
	vbgcat = time.Now()
	if _, e := db.Exec(ctx, `DELETE FROM public.video_watch_sessions WHERE expires_at<NOW()-interval '1 hour'`); e != nil {
		return
	}
	entries, e := os.ReadDir(filepath.Join(vbd, "tmp"))
	if e == nil {
		for _, f := range entries {
			if f.IsDir() {
				continue
			}
			i, er := f.Info()
			if er == nil && time.Since(i.ModTime()) > 24*time.Hour {
				os.Remove(filepath.Join(vbd, "tmp", f.Name()))
			}
		}
	}
	for _, spec := range [][3]string{{"src", ".src", "source"}, {"out", ".mp4", "failik"}, {"previews", ".webp", "preview"}} {
		entries, e = os.ReadDir(filepath.Join(vbd, spec[0]))
		if e != nil {
			continue
		}
		for _, f := range entries {
			if spec[0] == "out" && strings.HasSuffix(f.Name(), ".mp4.part") && vbname(strings.TrimSuffix(f.Name(), ".part"), ".mp4") {
				i, er := f.Info()
				if er == nil && time.Since(i.ModTime()) > 24*time.Hour {
					os.Remove(filepath.Join(vbd, spec[0], f.Name()))
				}
				continue
			}
			if !vbname(f.Name(), spec[1]) {
				continue
			}
			i, er := f.Info()
			if er != nil || time.Since(i.ModTime()) < 24*time.Hour {
				continue
			}
			var registered bool
			er = db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM public.videos WHERE `+spec[2]+`=$1)`, f.Name()).Scan(&registered)
			if er != nil {
				return
			}
			if !registered {
				os.Remove(filepath.Join(vbd, spec[0], f.Name()))
			}
		}
	}
}

const vcsize = 128 << 10
const vcd = vbd + "/.chunks"

type Vcm struct {
	Na          string `json:"nazva"`
	Op          string `json:"opis"`
	Name        string `json:"name"`
	Size        int64  `json:"size"`
	PreviewName string `json:"preview_name"`
	PreviewSize int64  `json:"preview_size"`
}
type Vcs struct {
	uid       int
	key       string
	m         Vcm
	at        time.Time
	got       [2][]bool
	hashes    [2][]string
	writing   [2][]bool
	active    int
	busy      bool
	cancelled bool
	can       context.CancelFunc
	done      json.RawMessage
	status    int
}
type Vcr struct {
	h http.Header
	b Vbbuf
	n int
}

func (v *Vcr) Header() http.Header { return v.h }
func (v *Vcr) WriteHeader(n int) {
	if v.n == 0 {
		v.n = n
	}
}
func (v *Vcr) Write(b []byte) (int, error) {
	if v.n == 0 {
		v.n = 200
	}
	return v.b.Write(b)
}

var vcmu sync.Mutex
var vcs = map[string]*Vcs{}
var vcgate = make(chan struct{}, 8)
var vcfinish = make(chan struct{}, 1)

func vcjson(w http.ResponseWriter, r *http.Request, v any) bool {
	ct, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if e != nil || ct != "application/json" {
		vbe(w, 415, "VALID")
		return false
	}
	rc := http.NewResponseController(w)
	if rc.SetReadDeadline(time.Now().Add(45*time.Second)) == nil {
		defer rc.SetReadDeadline(time.Time{})
	}
	r.Body = http.MaxBytesReader(w, r.Body, 256<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if d.Decode(v) != nil {
		vbe(w, 400, "VALID")
		return false
	}
	var x any
	if d.Decode(&x) != io.EOF {
		vbe(w, 400, "VALID")
		return false
	}
	return true
}
func vcpath(k string, f int) string {
	ext := ".v"
	if f == 1 {
		ext = ".p"
	}
	return filepath.Join(vcd, k+ext)
}
func vcvalid(k string) bool { return vbname(k+".v", ".v") }
func vcsizeof(s *Vcs, f int) int64 {
	if f == 0 {
		return s.m.Size
	}
	return s.m.PreviewSize
}
func vcdrop(k string) {
	if !vcvalid(k) {
		return
	}
	os.Remove(vcpath(k, 0))
	os.Remove(vcpath(k, 1))
	delete(vcs, k)
}
func vcgc() {
	vcmu.Lock()
	defer vcmu.Unlock()
	for k, s := range vcs {
		if s.active == 0 && !s.busy && (s.cancelled || time.Since(s.at) > 30*time.Minute) {
			vcdrop(k)
		}
	}
}
func vcinit() error {
	if e := os.MkdirAll(vcd, 0700); e != nil {
		return e
	}
	ls, e := os.ReadDir(vcd)
	if e != nil {
		return e
	}
	for _, f := range ls {
		if f.IsDir() {
			continue
		}
		n := f.Name()
		if vbname(n, ".v") || vbname(n, ".p") {
			if e = os.Remove(filepath.Join(vcd, n)); e != nil {
				return e
			}
		}
	}
	return nil
}
func vcstart(w http.ResponseWriter, r *http.Request, u int) {
	var m Vcm
	if !vcjson(w, r, &m) {
		return
	}
	m.Na = strings.TrimSpace(m.Na)
	key := r.Header.Get("Idempotency-Key")
	if !vbuuid(key) || m.Na == "" || !vbvalid(m.Na, 160) || !vbvalid(m.Op, 5000) || m.Name == "" || !vbvalid(m.Name, 255) || m.PreviewName == "" || !vbvalid(m.PreviewName, 255) {
		vbe(w, 400, "VALID")
		return
	}
	if m.Size < 1 || m.Size > vbmax {
		vbe(w, 413, "SIZE")
		return
	}
	if m.PreviewSize < 1 || m.PreviewSize > 20<<20 {
		vbe(w, 413, "PREVIEW_SIZE")
		return
	}
	ctx, c := context.WithTimeout(r.Context(), 10*time.Second)
	defer c()
	var id int64
	var same bool
	e := db.QueryRow(ctx, `SELECT id,nazva=$3 AND opis=$4 AND original_name=$5 AND source_size=$6 FROM public.videos WHERE avtor_id=$1 AND client_key=$2::uuid`, u, key, m.Na, m.Op, filepath.Base(m.Name), m.Size).Scan(&id, &same)
	if e == nil {
		if !same {
			vbe(w, 409, "VALID")
			return
		}
		v, er := vbdto(ctx, db, u, id)
		if er != nil {
			vbe(w, 500, "HTTP")
			return
		}
		vbj(w, 200, map[string]any{"video": v})
		return
	}
	if e != pgx.ErrNoRows {
		vbe(w, 500, "HTTP")
		return
	}
	vcgc()
	vcmu.Lock()
	defer vcmu.Unlock()
	for k, s := range vcs {
		if s.uid == u && s.key == key {
			if s.m != m || s.cancelled {
				vbe(w, 409, "VALID")
				return
			}
			s.at = time.Now()
			if len(s.done) > 0 {
				vbj(w, 200, map[string]any{"video": s.done})
				return
			}
			vbj(w, 200, map[string]any{"token": k, "chunkSize": vcsize, "parts": len(s.got[0]), "previewParts": len(s.got[1])})
			return
		}
	}
	if len(vcs) >= 64 {
		for token, old := range vcs {
			if len(old.done) > 0 && !old.busy && old.active == 0 {
				vcdrop(token)
			}
		}
	}
	count, active, total := 0, 0, int64(0)
	for _, s := range vcs {
		if len(s.done) > 0 {
			continue
		}
		active++
		total += s.m.Size + s.m.PreviewSize
		if s.uid == u {
			count++
		}
	}
	if count >= 2 || active >= 8 || len(vcs) >= 64 || total+m.Size+m.PreviewSize > 1<<30 {
		vbe(w, 429, "HTTP")
		return
	}
	var disk syscall.Statfs_t
	if syscall.Statfs(vcd, &disk) != nil || uint64(disk.Bavail)*uint64(disk.Bsize) < uint64(total+m.Size+m.PreviewSize+(512<<20)) {
		vbe(w, 507, "HTTP")
		return
	}
	k, e := vbrnd()
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	if _, ok := vcs[k]; ok {
		vbe(w, 500, "HTTP")
		return
	}
	s := &Vcs{uid: u, key: key, m: m, at: time.Now()}
	created := []string{}
	for f := 0; f < 2; f++ {
		n := int((vcsizeof(s, f) + vcsize - 1) / vcsize)
		s.got[f] = make([]bool, n)
		s.hashes[f] = make([]string, n)
		s.writing[f] = make([]bool, n)
		p := vcpath(k, f)
		file, er := os.OpenFile(p, os.O_CREATE|os.O_EXCL|os.O_RDWR, 0600)
		if er == nil {
			created = append(created, p)
			er = file.Truncate(vcsizeof(s, f))
			ce := file.Close()
			if er == nil {
				er = ce
			}
		}
		if er != nil {
			for _, p := range created {
				os.Remove(p)
			}
			vbe(w, 500, "HTTP")
			return
		}
	}
	vcs[k] = s
	vbj(w, 201, map[string]any{"token": k, "chunkSize": vcsize, "parts": len(s.got[0]), "previewParts": len(s.got[1])})
}
func vcpart(w http.ResponseWriter, r *http.Request, u int, k string) {
	var p struct {
		File  string `json:"file"`
		Index int    `json:"index"`
		Data  string `json:"data"`
		Hash  string `json:"sha256"`
	}
	if !vcjson(w, r, &p) {
		return
	}
	f := 0
	if p.File == "preview" {
		f = 1
	} else if p.File != "video" {
		vbe(w, 400, "VALID")
		return
	}
	if p.Index < 0 || len(p.Hash) != 64 || len(p.Data) > ((vcsize+2)/3)*4 {
		vbe(w, 400, "VALID")
		return
	}
	b, e := base64.StdEncoding.Strict().DecodeString(p.Data)
	if e != nil || len(b) < 1 || len(b) > vcsize {
		vbe(w, 400, "VALID")
		return
	}
	h := sha256.Sum256(b)
	if hex.EncodeToString(h[:]) != p.Hash {
		vbe(w, 400, "VALID")
		return
	}
	vcmu.Lock()
	s := vcs[k]
	if s == nil || s.uid != u || s.cancelled || time.Since(s.at) > 30*time.Minute {
		vcmu.Unlock()
		vbe(w, 404, "NOT_FOUND")
		return
	}
	if p.Index >= len(s.got[f]) {
		vcmu.Unlock()
		vbe(w, 400, "VALID")
		return
	}
	want := int64(vcsize)
	if rest := vcsizeof(s, f) - int64(p.Index)*vcsize; rest < want {
		want = rest
	}
	if int64(len(b)) != want {
		vcmu.Unlock()
		vbe(w, 400, "VALID")
		return
	}
	if s.got[f][p.Index] {
		same := s.hashes[f][p.Index] == p.Hash
		s.at = time.Now()
		vcmu.Unlock()
		if !same {
			vbe(w, 409, "VALID")
			return
		}
		vbj(w, 200, map[string]any{"file": p.File, "index": p.Index})
		return
	}
	if s.busy || len(s.done) > 0 || s.writing[f][p.Index] || s.active >= 2 {
		vcmu.Unlock()
		vbe(w, 409, "HTTP")
		return
	}
	s.active++
	s.writing[f][p.Index] = true
	s.at = time.Now()
	vcmu.Unlock()
	defer func() {
		vcmu.Lock()
		s.active--
		s.writing[f][p.Index] = false
		if s.cancelled && s.active == 0 && !s.busy {
			vcdrop(k)
		}
		vcmu.Unlock()
	}()
	file, e := os.OpenFile(vcpath(k, f), os.O_WRONLY, 0)
	if e != nil {
		vbe(w, 500, "HTTP")
		return
	}
	n, e := file.WriteAt(b, int64(p.Index)*vcsize)
	if e == nil {
		e = file.Sync()
	}
	ce := file.Close()
	if e != nil || ce != nil || n != len(b) {
		vbe(w, 500, "HTTP")
		return
	}
	vcmu.Lock()
	s.got[f][p.Index] = true
	s.hashes[f][p.Index] = p.Hash
	s.at = time.Now()
	vcmu.Unlock()
	vbj(w, 200, map[string]any{"file": p.File, "index": p.Index})
}
func vcverify(ctx context.Context, k string, s *Vcs) error {
	b := make([]byte, vcsize)
	for f := 0; f < 2; f++ {
		file, e := os.Open(vcpath(k, f))
		if e != nil {
			return e
		}
		fi, e := file.Stat()
		if e != nil || !fi.Mode().IsRegular() || fi.Size() != vcsizeof(s, f) {
			file.Close()
			return errors.New("staged size")
		}
		for i, hash := range s.hashes[f] {
			if e = ctx.Err(); e != nil {
				file.Close()
				return e
			}
			want := int64(vcsize)
			if rest := vcsizeof(s, f) - int64(i)*vcsize; rest < want {
				want = rest
			}
			n, er := file.ReadAt(b[:int(want)], int64(i)*vcsize)
			if er != nil || int64(n) != want {
				file.Close()
				return errors.New("staged read")
			}
			h := sha256.Sum256(b[:n])
			if hex.EncodeToString(h[:]) != hash {
				file.Close()
				return errors.New("staged hash")
			}
		}
		file.Close()
	}
	return nil
}
func vcstream(mw *multipart.Writer, k string, s *Vcs) error {
	if e := mw.WriteField("nazva", s.m.Na); e != nil {
		return e
	}
	if e := mw.WriteField("opis", s.m.Op); e != nil {
		return e
	}
	for f := 0; f < 2; f++ {
		field, name := "video", s.m.Name
		if f == 1 {
			field, name = "preview", s.m.PreviewName
		}
		part, e := mw.CreateFormFile(field, name)
		if e != nil {
			return e
		}
		file, e := os.Open(vcpath(k, f))
		if e != nil {
			return e
		}
		_, e = io.Copy(part, file)
		ce := file.Close()
		if e != nil {
			return e
		}
		if ce != nil {
			return ce
		}
	}
	return mw.Close()
}
func vcend(w http.ResponseWriter, r *http.Request, u int, k string) {
	var a struct{}
	if !vcjson(w, r, &a) {
		return
	}
	vcmu.Lock()
	s := vcs[k]
	if s == nil {
		vcmu.Unlock()
		key := r.Header.Get("Idempotency-Key")
		if vbuuid(key) {
			ctx, c := context.WithTimeout(r.Context(), 10*time.Second)
			defer c()
			var id int64
			if e := db.QueryRow(ctx, `SELECT id FROM public.videos WHERE avtor_id=$1 AND client_key=$2::uuid`, u, key).Scan(&id); e == nil {
				if v, e := vbdto(ctx, db, u, id); e == nil {
					vbj(w, 200, v)
					return
				}
			}
		}
		vbe(w, 404, "NOT_FOUND")
		return
	}
	if s.uid != u || s.cancelled || time.Since(s.at) > 30*time.Minute {
		vcmu.Unlock()
		vbe(w, 404, "NOT_FOUND")
		return
	}
	if r.Header.Get("Idempotency-Key") != s.key {
		vcmu.Unlock()
		vbe(w, 400, "VALID")
		return
	}
	if len(s.done) > 0 {
		b := append(json.RawMessage(nil), s.done...)
		n := s.status
		s.at = time.Now()
		vcmu.Unlock()
		vbj(w, n, b)
		return
	}
	if s.busy || s.active > 0 {
		vcmu.Unlock()
		vbe(w, 409, "HTTP")
		return
	}
	for f := 0; f < 2; f++ {
		for _, got := range s.got[f] {
			if !got {
				vcmu.Unlock()
				vbe(w, 409, "VALID")
				return
			}
		}
	}
	select {
	case vcfinish <- struct{}{}:
	default:
		vcmu.Unlock()
		vbe(w, 429, "HTTP")
		return
	}
	ctx, can := context.WithCancel(r.Context())
	s.busy = true
	s.can = can
	s.at = time.Now()
	vcmu.Unlock()
	defer func() {
		can()
		<-vcfinish
		vcmu.Lock()
		s.busy = false
		s.can = nil
		s.at = time.Now()
		if s.cancelled && s.active == 0 {
			vcdrop(k)
		}
		vcmu.Unlock()
	}()
	if e := vcverify(ctx, k, s); e != nil {
		vbe(w, 400, "VALID")
		return
	}
	pr, pw := io.Pipe()
	mw := multipart.NewWriter(pw)
	done := make(chan error, 1)
	stop := context.AfterFunc(ctx, func() { pr.CloseWithError(ctx.Err()); pw.CloseWithError(ctx.Err()) })
	defer stop()
	go func() { e := vcstream(mw, k, s); pw.CloseWithError(e); done <- e }()
	rr := r.Clone(ctx)
	rr.Header = r.Header.Clone()
	rr.Header.Set("Content-Type", mw.FormDataContentType())
	rr.Header.Del("Content-Length")
	rr.Header.Set("Idempotency-Key", s.key)
	rr.Body = pr
	rr.ContentLength = -1
	rec := &Vcr{h: make(http.Header), b: Vbbuf{N: 1 << 20}}
	vbup(rec, rr)
	pr.Close()
	<-done
	if rec.n == 0 {
		vbe(w, 500, "HTTP")
		return
	}
	b := append(json.RawMessage(nil), rec.b.Bytes()...)
	if !json.Valid(b) {
		vbe(w, 500, "HTTP")
		return
	}
	if rec.n >= 200 && rec.n < 300 {
		vcmu.Lock()
		s.done = b
		s.status = rec.n
		s.at = time.Now()
		vcmu.Unlock()
		os.Remove(vcpath(k, 0))
		os.Remove(vcpath(k, 1))
	}
	vbj(w, rec.n, b)
}
func vccancel(w http.ResponseWriter, r *http.Request, u int, k string) {
	var a struct{}
	if !vcjson(w, r, &a) {
		return
	}
	vcmu.Lock()
	defer vcmu.Unlock()
	s := vcs[k]
	if s == nil {
		w.WriteHeader(204)
		return
	}
	if s.uid != u {
		vbe(w, 404, "NOT_FOUND")
		return
	}
	s.cancelled = true
	if s.can != nil {
		s.can()
	}
	if s.active == 0 && !s.busy {
		vcdrop(k)
		w.WriteHeader(204)
	} else {
		vbj(w, 202, map[string]bool{"cancelled": true})
	}
}
func vch(w http.ResponseWriter, r *http.Request) {
	u, ok := vbauth(w, r)
	if !ok {
		return
	}
	select {
	case vcgate <- struct{}{}:
		defer func() { <-vcgate }()
	default:
		vbe(w, 429, "HTTP")
		return
	}
	op := r.URL.Query().Get("op")
	if op == "start" {
		vcstart(w, r, u)
		return
	}
	k := r.URL.Query().Get("token")
	if !vcvalid(k) {
		vbe(w, 400, "VALID")
		return
	}
	switch op {
	case "part":
		vcpart(w, r, u, k)
	case "finish":
		vcend(w, r, u, k)
	case "cancel":
		vccancel(w, r, u, k)
	default:
		vbe(w, 400, "VALID")
	}
}

type DruziRelation struct {
	ID        int64  `json:"id"`
	First     int    `json:"first_id"`
	Second    int    `json:"second_id"`
	Status    string `json:"status"`
	Direction string `json:"direction"`
}
type DruziNotice struct {
	ID       int64     `json:"id"`
	UID      int       `json:"uid"`
	Kind     string    `json:"kind"`
	Username string    `json:"username"`
	Photo    string    `json:"photo"`
	Frame    string    `json:"frame"`
	At       time.Time `json:"at"`
	Read     bool      `json:"read"`
}
type DruziCursor struct {
	At time.Time `json:"at"`
	ID int64     `json:"id"`
}

func drJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "private, no-store")
	w.Header().Set("Vary", "Cookie")
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
func drError(w http.ResponseWriter, status int, message string) {
	drJSON(w, status, map[string]string{"error": message})
}
func drAuth(w http.ResponseWriter, r *http.Request) (int, bool) {
	s, e := st.Get(r, "s")
	if e != nil {
		drError(w, 401, "увійди в акаунт")
		return 0, false
	}
	u, ok := s.Values["uid"].(int)
	if !ok || u < 1 {
		drError(w, 401, "увійди в акаунт")
		return 0, false
	}
	return u, true
}
func drBody(w http.ResponseWriter, r *http.Request, v any) bool {
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		drError(w, 403, "немає доступу")
		return false
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		o, e := url.Parse(origin)
		if e != nil || (o.Scheme != "http" && o.Scheme != "https") || !strings.EqualFold(o.Host, r.Host) || o.User != nil || o.RawQuery != "" || o.Fragment != "" || (o.Path != "" && o.Path != "/") {
			drError(w, 403, "немає доступу")
			return false
		}
	}
	mt, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if e != nil || mt != "application/json" {
		drError(w, 415, "потрібен JSON")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, 32<<10)
	d := json.NewDecoder(r.Body)
	d.DisallowUnknownFields()
	if d.Decode(v) != nil {
		drError(w, 400, "невірні дані")
		return false
	}
	var extra any
	if d.Decode(&extra) != io.EOF {
		drError(w, 400, "невірні дані")
		return false
	}
	return true
}
func drDirection(v DruziRelation, u int) DruziRelation {
	v.Direction = "none"
	if v.ID == 0 {
		v.Status = "none"
		return v
	}
	if v.Status == "priynato" {
		v.Direction = "friend"
	} else if v.First == u {
		v.Direction = "outgoing"
	} else {
		v.Direction = "incoming"
	}
	return v
}
func drPair(ctx context.Context, q interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}, u, target int, lock bool) (DruziRelation, error) {
	var v DruziRelation
	sql := `SELECT id,first_id,second_id,status FROM public.druzi WHERE LEAST(first_id,second_id)=LEAST($1::integer,$2::integer) AND GREATEST(first_id,second_id)=GREATEST($1::integer,$2::integer)`
	if lock {
		sql += ` FOR UPDATE`
	}
	e := q.QueryRow(ctx, sql, u, target).Scan(&v.ID, &v.First, &v.Second, &v.Status)
	if e == pgx.ErrNoRows {
		return drDirection(v, u), nil
	}
	return drDirection(v, u), e
}
func drHandle(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" && r.Method != "POST" {
		w.Header().Set("Allow", "GET, POST")
		drError(w, 405, "метод не дозволено")
		return
	}
	u, ok := drAuth(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	if r.Method == "GET" {
		target, e := strconv.Atoi(r.URL.Query().Get("uid"))
		if e != nil || target < 1 || target > 2147483647 {
			drError(w, 400, "невірний користувач")
			return
		}
		v, e := drPair(ctx, db, u, target, false)
		if e != nil {
			drError(w, 500, "не вдалося завантажити стан дружби")
			return
		}
		drJSON(w, 200, v)
		return
	}
	var p struct {
		UID int    `json:"uid"`
		Act string `json:"act"`
		ID  int64  `json:"id"`
	}
	if !drBody(w, r, &p) {
		return
	}
	if p.UID < 1 || p.UID > 2147483647 || p.UID == u || p.ID < 0 || p.ID > 9007199254740991 {
		drError(w, 400, "невірний користувач")
		return
	}
	switch p.Act {
	case "send":
	case "accept", "decline", "cancel":
		if p.ID < 1 {
			drError(w, 400, "невірний запит у друзі")
			return
		}
	default:
		drError(w, 400, "невідома дія")
		return
	}
	tx, e := db.Begin(ctx)
	if e != nil {
		drError(w, 500, "не вдалося зберегти запит")
		return
	}
	defer tx.Rollback(context.Background())
	a, b := u, p.UID
	if a > b {
		a, b = b, a
	}
	if _, e = tx.Exec(ctx, `SELECT pg_advisory_xact_lock($1::integer,$2::integer)`, a, b); e != nil {
		drError(w, 500, "не вдалося зберегти запит")
		return
	}
	v, e := drPair(ctx, tx, u, p.UID, true)
	if e != nil {
		drError(w, 500, "не вдалося завантажити стан дружби")
		return
	}
	if p.Act == "send" {
		if v.ID == 0 {
			var exists bool
			if e = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)`, p.UID).Scan(&exists); e != nil {
				drError(w, 500, "не вдалося перевірити користувача")
				return
			}
			if !exists {
				drError(w, 404, "користувача не знайдено")
				return
			}
			e = tx.QueryRow(ctx, `INSERT INTO public.druzi(first_id,second_id,status) VALUES($1,$2,'waiting') RETURNING id,first_id,second_id,status`, u, p.UID).Scan(&v.ID, &v.First, &v.Second, &v.Status)
		}
	} else if v.ID != 0 {
		if v.ID != p.ID {
			drError(w, 409, "запит уже змінився, онови його стан")
			return
		}
		switch p.Act {
		case "accept":
			if v.Second != u {
				drError(w, 403, "прийняти запит може лише отримувач")
				return
			}
			if v.Status == "waiting" {
				_, e = tx.Exec(ctx, `UPDATE public.druzi SET status='priynato',accepted_at=clock_timestamp(),first_seen_at=NULL,second_seen_at=COALESCE(second_seen_at,clock_timestamp()) WHERE id=$1`, v.ID)
				v.Status = "priynato"
			}
		case "decline", "cancel":
			if p.Act == "decline" && v.Second != u || p.Act == "cancel" && v.First != u {
				drError(w, 403, "немає доступу до цього запиту")
				return
			}
			if v.Status != "waiting" {
				drError(w, 409, "цей запит уже прийнято")
				return
			}
			_, e = tx.Exec(ctx, `DELETE FROM public.druzi WHERE id=$1`, v.ID)
			v = DruziRelation{}
		}
	}
	if e != nil {
		drError(w, 500, "не вдалося зберегти запит")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		drError(w, 500, "не вдалося зберегти запит")
		return
	}
	drJSON(w, 200, drDirection(v, u))
}
func drFriends(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.Header().Set("Allow", "GET")
		drError(w, 405, "метод не дозволено")
		return
	}

	_, ok := drAuth(w, r)
	if !ok {
		return
	}

	target, e := strconv.Atoi(r.URL.Query().Get("uid"))
	if e != nil || target < 1 {
		drError(w, 400, "невірний користувач")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	rows, e := db.Query(ctx, `
		SELECT u.id, u.username,
		       COALESCE(u.photo, ''),
		       COALESCE(u.frame, '')
		FROM public.druzi d
		JOIN public.useri u
		  ON u.id = CASE
		      WHEN d.first_id = $1 THEN d.second_id
		      ELSE d.first_id
		  END
		WHERE (d.first_id = $1 OR d.second_id = $1)
		  AND d.status = 'priynato'
		ORDER BY COALESCE(d.accepted_at, d.created_at) DESC, d.id DESC
	`, target)

	if e != nil {
		drError(w, 500, "не вдалося завантажити друзів")
		return
	}
	defer rows.Close()

	type Friend struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
		Photo    string `json:"photo"`
		Frame    string `json:"frame"`
	}

	friends := make([]Friend, 0)

	for rows.Next() {
		var f Friend
		if e = rows.Scan(&f.ID, &f.Username, &f.Photo, &f.Frame); e != nil {
			drError(w, 500, "не вдалося завантажити друзів")
			return
		}
		friends = append(friends, f)
	}

	if e = rows.Err(); e != nil {
		drError(w, 500, "не вдалося завантажити друзів")
		return
	}

	drJSON(w, 200, map[string]any{"friends": friends})
}

func drUnread(ctx context.Context, q interface {
	QueryRow(context.Context, string, ...any) pgx.Row
}, u int) (int, error) {
	var count int
	e := q.QueryRow(ctx, `SELECT count(*) FROM public.druzi WHERE (second_id=$1 AND status='waiting' AND second_seen_at IS NULL) OR (first_id=$1 AND status='priynato' AND first_seen_at IS NULL)`, u).Scan(&count)
	return count, e
}
func drNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		w.Header().Set("Allow", "GET")
		drError(w, 405, "метод не дозволено")
		return
	}
	u, ok := drAuth(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	var before *time.Time
	var id int64
	if token := r.URL.Query().Get("cursor"); token != "" {
		if len(token) > 512 {
			drError(w, 400, "невірна сторінка")
			return
		}
		b, e := base64.RawURLEncoding.DecodeString(token)
		var v DruziCursor
		if e != nil || json.Unmarshal(b, &v) != nil || v.At.IsZero() || v.ID < 1 || v.ID > 9007199254740991 {
			drError(w, 400, "невірна сторінка")
			return
		}
		before = &v.At
		id = v.ID
	}
	tx, e := db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.RepeatableRead, AccessMode: pgx.ReadOnly})
	if e != nil {
		drError(w, 500, "не вдалося завантажити сповіщення")
		return
	}
	defer tx.Rollback(context.Background())
	count, e := drUnread(ctx, tx, u)
	if e != nil {
		drError(w, 500, "друзі ще не підключені або недоступні")
		return
	}
	rows, e := tx.Query(ctx, `SELECT d.id,u.id,CASE WHEN d.status='waiting' THEN 'request' ELSE 'accepted' END,u.username,COALESCE(u.photo,''),COALESCE(u.frame,''),COALESCE(d.accepted_at,d.created_at),CASE WHEN d.status='waiting' THEN d.second_seen_at IS NOT NULL ELSE d.first_seen_at IS NOT NULL END FROM public.druzi d JOIN public.useri u ON u.id=CASE WHEN d.status='waiting' THEN d.first_id ELSE d.second_id END WHERE ((d.second_id=$1 AND d.status='waiting') OR (d.first_id=$1 AND d.status='priynato')) AND ($2::timestamptz IS NULL OR (COALESCE(d.accepted_at,d.created_at),d.id)<($2,$3::bigint)) ORDER BY COALESCE(d.accepted_at,d.created_at) DESC,d.id DESC LIMIT 51`, u, before, id)
	if e != nil {
		drError(w, 500, "не вдалося завантажити сповіщення")
		return
	}
	items := make([]DruziNotice, 0, 50)
	var next any
	for rows.Next() {
		var v DruziNotice
		if e = rows.Scan(&v.ID, &v.UID, &v.Kind, &v.Username, &v.Photo, &v.Frame, &v.At, &v.Read); e != nil {
			rows.Close()
			drError(w, 500, "не вдалося завантажити сповіщення")
			return
		}
		if len(items) == 50 {
			last := items[len(items)-1]
			b, _ := json.Marshal(DruziCursor{At: last.At, ID: last.ID})
			next = base64.RawURLEncoding.EncodeToString(b)
			break
		}
		items = append(items, v)
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		drError(w, 500, "не вдалося завантажити сповіщення")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		drError(w, 500, "не вдалося завантажити сповіщення")
		return
	}
	drJSON(w, 200, map[string]any{"items": items, "unread": count, "next": next})
}
func drRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.Header().Set("Allow", "POST")
		drError(w, 405, "метод не дозволено")
		return
	}
	u, ok := drAuth(w, r)
	if !ok {
		return
	}
	var p struct {
		Items []struct {
			ID   int64  `json:"id"`
			Kind string `json:"kind"`
		} `json:"items"`
	}
	if !drBody(w, r, &p) {
		return
	}
	if len(p.Items) < 1 || len(p.Items) > 100 {
		drError(w, 400, "невірні сповіщення")
		return
	}
	requests := []int64{}
	accepted := []int64{}
	for _, v := range p.Items {
		if v.ID < 1 || v.ID > 9007199254740991 {
			drError(w, 400, "невірні сповіщення")
			return
		}
		switch v.Kind {
		case "request":
			requests = append(requests, v.ID)
		case "accepted":
			accepted = append(accepted, v.ID)
		default:
			drError(w, 400, "невірні сповіщення")
			return
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	tx, e := db.Begin(ctx)
	if e != nil {
		drError(w, 500, "не вдалося зберегти прочитане")
		return
	}
	defer tx.Rollback(context.Background())
	if len(requests) > 0 {
		_, e = tx.Exec(ctx, `UPDATE public.druzi SET second_seen_at=clock_timestamp() WHERE id=ANY($2::bigint[]) AND second_id=$1 AND status='waiting' AND second_seen_at IS NULL`, u, requests)
	}
	if e == nil && len(accepted) > 0 {
		_, e = tx.Exec(ctx, `UPDATE public.druzi SET first_seen_at=clock_timestamp() WHERE id=ANY($2::bigint[]) AND first_id=$1 AND status='priynato' AND first_seen_at IS NULL`, u, accepted)
	}
	if e != nil {
		drError(w, 500, "не вдалося зберегти прочитане")
		return
	}
	if e = tx.Commit(ctx); e != nil {
		drError(w, 500, "не вдалося зберегти прочитане")
		return
	}
	count, e := drUnread(ctx, db, u)
	if e != nil {
		drError(w, 500, "не вдалося завантажити сповіщення")
		return
	}
	drJSON(w, 200, map[string]int{"unread": count})
}
func drSchema(ctx context.Context) bool {
	rows, e := db.Query(ctx, `SELECT id,first_id,second_id,status,created_at,accepted_at,first_seen_at,second_seen_at FROM public.druzi LIMIT 0`)
	if e == nil {
		rows.Close()
	}
	var ok bool
	if e == nil {
		e = db.QueryRow(ctx, `SELECT has_table_privilege(current_user,'public.druzi','SELECT') AND has_table_privilege(current_user,'public.druzi','INSERT') AND has_table_privilege(current_user,'public.druzi','UPDATE') AND has_table_privilege(current_user,'public.druzi','DELETE') AND has_sequence_privilege(current_user,pg_get_serial_sequence('public.druzi','id'),'USAGE') AND EXISTS(SELECT 1 FROM pg_index WHERE indexrelid=to_regclass('public.druzi_pair_unique') AND indrelid='public.druzi'::regclass AND indisunique AND indisvalid)`).Scan(&ok)
	}
	return e == nil && ok
}
func drCheck() bool {
	if len(os.Args) != 2 || os.Args[1] != "--druzi-check" {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if !drSchema(ctx) {
		fmt.Fprintln(os.Stderr, "druzi: спочатку створи таблицю та індекси; власник таблиці має бути mriya_app")
		os.Exit(1)
	}
	fmt.Println("druzi: OK")
	return true
}

type SyItem struct {
	ID          int64     `json:"id"`
	Author      int       `json:"avtor_id"`
	Username    string    `json:"username"`
	Name        string    `json:"nazva"`
	Description string    `json:"opis"`
	URL         string    `json:"url"`
	Kind        string    `json:"vyd"`
	Screenshot  string    `json:"skrin"`
	Revision    int       `json:"revision"`
	Created     time.Time `json:"created_at"`
	Updated     time.Time `json:"updated_at"`
	orderName   string
}

var syRoot = filepath.Join("dist", "uploads", "saity")
var sySlots = make(chan struct{}, 2)

const syColumns = `s.id,s.avtor_id,COALESCE(u.username,''),s.nazva,s.opis,s.url,s.vyd,s.skrin,s.revision,s.created_at,s.updated_at,lower(s.nazva)`
const syFrom = ` FROM public.saity s JOIN public.useri u ON u.id=s.avtor_id `

func syKind(s string) bool {
	switch s {
	case "personal", "blog", "forum", "community", "news", "media", "education", "science", "reference", "library", "games", "technology", "software", "music", "video", "art", "portfolio", "shop", "services", "other":
		return true
	}
	return false
}
func syScan(row interface{ Scan(...any) error }) (SyItem, error) {
	var v SyItem
	e := row.Scan(&v.ID, &v.Author, &v.Username, &v.Name, &v.Description, &v.URL, &v.Kind, &v.Screenshot, &v.Revision, &v.Created, &v.Updated, &v.orderName)
	return v, e
}
func syAddress(s string) string {
	s = strings.TrimSpace(s)
	if !utf8.ValidString(s) || len(s) > 8192 {
		return ""
	}
	for _, c := range s {
		if c <= 32 || c == 127 {
			return ""
		}
	}
	if !strings.Contains(s, "://") {
		s = "https://" + s
	}
	u, e := url.Parse(s)
	if e != nil || u.User != nil || u.Opaque != "" {
		return ""
	}
	u.Scheme = strings.ToLower(u.Scheme)
	if u.Scheme != "http" && u.Scheme != "https" {
		return ""
	}
	h := strings.ToLower(u.Hostname())
	if h == "" {
		return ""
	}
	for _, c := range h {
		if c > 127 {
			return ""
		}
	}
	port := u.Port()
	if port != "" {
		n, e := strconv.Atoi(port)
		if e != nil || n < 0 || n > 65535 {
			return ""
		}
		if u.Scheme == "https" && n == 443 || u.Scheme == "http" && n == 80 {
			port = ""
		} else {
			port = strconv.Itoa(n)
		}
	}
	if strings.Contains(h, ":") {
		h = "[" + h + "]"
	}
	u.Host = h
	if port != "" {
		u.Host = h + ":" + port
	}
	if u.Path == "" {
		u.Path = "/"
	}
	s = u.String()
	if utf8.RuneCountInString(s) > 2048 || len(s) > 8192 {
		return ""
	}
	return s
}
func sySame(w http.ResponseWriter, r *http.Request) bool {
	if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
		drError(w, 403, "немає доступу")
		return false
	}
	if origin := r.Header.Get("Origin"); origin != "" {
		u, e := url.Parse(origin)
		if e != nil || (u.Scheme != "https" && u.Scheme != "http") || !strings.EqualFold(u.Host, r.Host) || u.User != nil || u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/") {
			drError(w, 403, "немає доступу")
			return false
		}
	}
	return true
}
func syDBError(w http.ResponseWriter, e error) {
	var pg interface{ SQLState() string }
	if errors.As(e, &pg) {
		switch pg.SQLState() {
		case "23505":
			drError(w, 409, "цей сайт уже є у твоєму каталозі")
			return
		case "23503":
			drError(w, 401, "увійди в акаунт")
			return
		case "23514", "22001", "22021":
			drError(w, 400, "невірні дані сайту")
			return
		}
	}
	drError(w, 503, "не вдалося виконати запит до каталогу")
}
func syID(r *http.Request, key string) (int64, bool) {
	n, e := strconv.ParseInt(r.URL.Query().Get(key), 10, 64)
	return n, e == nil && n > 0 && n <= 9007199254740991
}
func syHandle(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		syList(w, r)
	case "POST", "PUT":
		sySave(w, r)
	case "DELETE":
		syDelete(w, r)
	default:
		w.Header().Set("Allow", "GET, POST, PUT, DELETE")
		drError(w, 405, "метод не дозволено")
	}
}
func syList(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	kind := r.URL.Query().Get("vyd")
	sort := r.URL.Query().Get("sort")
	if sort == "" {
		sort = "new"
	}
	limit := 24
	if raw := r.URL.Query().Get("limit"); raw != "" {
		n, e := strconv.Atoi(raw)
		if e != nil || n < 1 || n > 24 {
			drError(w, 400, "невірний розмір сторінки")
			return
		}
		limit = n
	}
	if !utf8.ValidString(q) || utf8.RuneCountInString(q) > 200 || strings.ContainsRune(q, 0) || kind != "" && !syKind(kind) {
		drError(w, 400, "невірні параметри пошуку")
		return
	}
	var order, compare string
	switch sort {
	case "new":
		order = "s.created_at DESC,s.id DESC"
		compare = "(s.created_at,s.id)<($4::timestamptz,$5::bigint)"
	case "old":
		order = "s.created_at ASC,s.id ASC"
		compare = "(s.created_at,s.id)>($4::timestamptz,$5::bigint)"
	case "az":
		order = "lower(s.nazva) ASC,s.id ASC"
		compare = "(lower(s.nazva),s.id)>($4::text,$5::bigint)"
	case "za":
		order = "lower(s.nazva) DESC,s.id DESC"
		compare = "(lower(s.nazva),s.id)<($4::text,$5::bigint)"
	default:
		drError(w, 400, "невірне сортування")
		return
	}
	hash := sha256.Sum256([]byte(q + "\x00" + kind + "\x00" + sort))
	var cursorID int64
	var cursorAt time.Time
	var cursorName string
	if token := r.URL.Query().Get("cursor"); token != "" {
		if len(token) > 1024 {
			drError(w, 400, "невірна сторінка")
			return
		}
		b, e := base64.RawURLEncoding.DecodeString(token)
		if e != nil || len(b) < 49 || len(b) > 689 || b[0] != 1 || !hmac.Equal(b[1:33], hash[:]) {
			drError(w, 400, "невірна сторінка")
			return
		}
		cursorID = int64(binary.BigEndian.Uint64(b[33:41]))
		cursorAt = time.UnixMicro(int64(binary.BigEndian.Uint64(b[41:49]))).UTC()
		cursorName = string(b[49:])
		if cursorID < 1 || cursorID > 9007199254740991 || cursorAt.Year() < 1 || cursorAt.Year() > 9999 || !utf8.ValidString(cursorName) || strings.ContainsRune(cursorName, 0) {
			drError(w, 400, "невірна сторінка")
			return
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	tx, e := db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.RepeatableRead, AccessMode: pgx.ReadOnly})
	if e != nil {
		syDBError(w, e)
		return
	}
	defer tx.Rollback(context.Background())
	where := ` WHERE ($1::text='' OR strpos(lower(s.nazva||' '||s.opis||' '||s.url),lower($1::text))>0) AND ($2::text='' OR s.vyd=$2::text) `
	var total int64
	if e = tx.QueryRow(ctx, `SELECT count(*) FROM public.saity s `+where, q, kind).Scan(&total); e != nil {
		syDBError(w, e)
		return
	}
	args := []any{q, kind, limit + 1}
	if cursorID > 0 {
		where += " AND " + compare
		if sort == "az" || sort == "za" {
			args = append(args, cursorName, cursorID)
		} else {
			args = append(args, cursorAt, cursorID)
		}
	}
	rows, e := tx.Query(ctx, `SELECT `+syColumns+syFrom+where+" ORDER BY "+order+" LIMIT $3::integer", args...)
	if e != nil {
		syDBError(w, e)
		return
	}
	items := make([]SyItem, 0, limit)
	more := false
	for rows.Next() {
		v, err := syScan(rows)
		if err != nil {
			rows.Close()
			syDBError(w, err)
			return
		}
		if len(items) == limit {
			more = true
			break
		}
		items = append(items, v)
	}
	e = rows.Err()
	rows.Close()
	if e != nil {
		syDBError(w, e)
		return
	}
	if e = tx.Commit(ctx); e != nil {
		syDBError(w, e)
		return
	}
	var next any
	if more && len(items) > 0 {
		last := items[len(items)-1]
		b := make([]byte, 49)
		b[0] = 1
		copy(b[1:33], hash[:])
		binary.BigEndian.PutUint64(b[33:41], uint64(last.ID))
		binary.BigEndian.PutUint64(b[41:49], uint64(last.Created.UnixMicro()))
		b = append(b, []byte(last.orderName)...)
		next = base64.RawURLEncoding.EncodeToString(b)
	}
	drJSON(w, 200, map[string]any{"items": items, "total": total, "next": next})
}
func syStore() error {
	if e := os.MkdirAll(syRoot, 0755); e != nil {
		return e
	}
	fi, e := os.Lstat(syRoot)
	if e != nil {
		return e
	}
	if !fi.IsDir() || fi.Mode()&os.ModeSymlink != 0 {
		return errors.New("invalid screenshot directory")
	}
	return os.Chmod(syRoot, 0755)
}
func syName(name string) bool {
	if len(name) < 5 || len(name) > 128 {
		return false
	}
	ext := filepath.Ext(name)
	if ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" {
		return false
	}
	base := strings.TrimSuffix(name, ext)
	if base == "" {
		return false
	}
	for _, c := range base {
		if !(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c == '_' || c == '-') {
			return false
		}
	}
	return true
}
func syFile(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	if !syName(name) {
		http.NotFound(w, r)
		return
	}
	p := filepath.Join(syRoot, name)
	fi, e := os.Lstat(p)
	if e != nil || !fi.Mode().IsRegular() {
		http.NotFound(w, r)
		return
	}
	f, e := os.Open(p)
	if e != nil {
		http.NotFound(w, r)
		return
	}
	defer f.Close()
	typ := "image/png"
	switch filepath.Ext(name) {
	case ".jpg", ".jpeg":
		typ = "image/jpeg"
	case ".webp":
		typ = "image/webp"
	}
	w.Header().Set("Content-Type", typ)
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("Content-Disposition", "inline")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	http.ServeContent(w, r, name, fi.ModTime(), f)
}
func syImage(ctx context.Context, h *multipart.FileHeader) (string, error) {
	if h == nil || h.Size < 1 || h.Size > 5<<20 {
		return "", errors.New("скриншот має бути не більший за 5 МБ")
	}
	f, e := h.Open()
	if e != nil {
		return "", errors.New("не вдалося прочитати скриншот")
	}
	raw, e := io.ReadAll(io.LimitReader(f, (5<<20)+1))
	f.Close()
	if e != nil || len(raw) < 12 || len(raw) > 5<<20 {
		return "", errors.New("некоректний файл скриншота")
	}
	ext := ""
	switch http.DetectContentType(raw) {
	case "image/png":
		ext = ".png"
	case "image/jpeg":
		ext = ".jpg"
	case "image/webp":
		ext = ".webp"
	default:
		return "", errors.New("обери PNG, JPG або WEBP")
	}
	private, e := os.MkdirTemp("", "mriya-saity-")
	if e != nil {
		return "", errors.New("не вдалося підготувати скриншот")
	}
	defer os.RemoveAll(private)
	source := filepath.Join(private, "source"+ext)
	if e = os.WriteFile(source, raw, 0600); e != nil {
		return "", errors.New("не вдалося підготувати скриншот")
	}
	raw = nil
	work, cancel := context.WithTimeout(ctx, 20*time.Second)
	defer cancel()
	formats := "image2,png_pipe,jpeg_pipe,webp_pipe"
	b, e := vbcommand(work, "ffprobe", "-v", "error", "-max_alloc", "134217728", "-protocol_whitelist", "file,pipe", "-format_whitelist", formats, "-select_streams", "v:0", "-show_entries", "stream=codec_name,width,height", "-of", "json", source)
	var probe struct {
		Streams []struct {
			Codec  string `json:"codec_name"`
			Width  int    `json:"width"`
			Height int    `json:"height"`
		} `json:"streams"`
	}
	if e != nil || json.Unmarshal(b, &probe) != nil || len(probe.Streams) != 1 {
		return "", errors.New("некоректний файл скриншота")
	}
	v := probe.Streams[0]
	if v.Codec != "png" && v.Codec != "mjpeg" && v.Codec != "webp" {
		return "", errors.New("обери PNG, JPG або WEBP")
	}
	if v.Width < 1 || v.Height < 1 || v.Width > 20000 || v.Height > 20000 || int64(v.Width)*int64(v.Height) > 20000000 {
		return "", errors.New("завеликий розмір зображення")
	}
	if e = syStore(); e != nil {
		return "", errors.New("каталог скриншотів недоступний")
	}
	out, e := os.CreateTemp(syRoot, ".saity-*.png")
	if e != nil {
		return "", errors.New("не вдалося зберегти скриншот")
	}
	temp := out.Name()
	out.Close()
	defer os.Remove(temp)
	_, e = vbcommand(work, "ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-max_alloc", "134217728", "-protocol_whitelist", "file,pipe", "-format_whitelist", formats, "-threads", "1", "-i", source, "-map", "0:v:0", "-frames:v", "1", "-an", "-sn", "-dn", "-map_metadata", "-1", "-threads", "1", "-filter_threads", "1", "-c:v", "png", "-compression_level", "6", "-fs", "33554432", "-f", "image2", "-update", "1", temp)
	if e != nil {
		return "", errors.New("не вдалося обробити скриншот")
	}
	image, e := os.Open(temp)
	if e != nil {
		return "", errors.New("не вдалося зберегти скриншот")
	}
	fi, e := image.Stat()
	var tail [12]byte
	if e == nil && fi.Size() >= 20 {
		_, e = image.ReadAt(tail[:], fi.Size()-12)
	} else {
		e = errors.New("invalid image")
	}
	image.Close()
	if e != nil || fi.Size() > 32<<20 || !bytes.Equal(tail[:], []byte{0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130}) {
		return "", errors.New("завеликий або некоректний скриншот")
	}
	var token [24]byte
	if _, e = rand.Read(token[:]); e != nil {
		return "", errors.New("не вдалося зберегти скриншот")
	}
	name := hex.EncodeToString(token[:]) + ".png"
	if e = os.Chmod(temp, 0644); e != nil {
		return "", errors.New("не вдалося зберегти скриншот")
	}
	if e = os.Rename(temp, filepath.Join(syRoot, name)); e != nil {
		return "", errors.New("не вдалося зберегти скриншот")
	}
	return "/uploads/saity/" + name, nil
}
func syDiscard(value string) {
	if !strings.HasPrefix(value, "/uploads/saity/") {
		return
	}
	name := strings.TrimPrefix(value, "/uploads/saity/")
	if len(name) != 52 || !strings.HasSuffix(name, ".png") {
		return
	}
	b, e := hex.DecodeString(name[:48])
	if e != nil || len(b) != 24 {
		return
	}
	os.Remove(filepath.Join(syRoot, name))
}
func syUnlink(value string) {
	if value == "" {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	var used bool
	if db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM public.saity WHERE skrin=$1)`, value).Scan(&used) == nil && !used {
		syDiscard(value)
	}
}
func sySave(w http.ResponseWriter, r *http.Request) {
	u, ok := drAuth(w, r)
	if !ok || !sySame(w, r) {
		return
	}
	select {
	case sySlots <- struct{}{}:
		defer func() { <-sySlots }()
	default:
		w.Header().Set("Retry-After", "2")
		drError(w, 429, "забагато завантажень, спробуй ще")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 40*time.Second)
	defer cancel()
	var id int64
	if r.Method == "PUT" {
		id, ok = syID(r, "id")
		if !ok {
			drError(w, 400, "невірний сайт")
			return
		}
	}
	ct, _, e := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if e != nil || ct != "multipart/form-data" {
		drError(w, 415, "потрібна форма з даними сайту")
		return
	}
	controller := http.NewResponseController(w)
	controller.SetReadDeadline(time.Now().Add(30 * time.Second))
	defer controller.SetReadDeadline(time.Time{})
	r.Body = http.MaxBytesReader(w, r.Body, 6<<20)
	defer func() {
		if r.MultipartForm != nil {
			r.MultipartForm.RemoveAll()
		}
	}()
	if e = r.ParseMultipartForm(1 << 20); e != nil {
		drError(w, 400, "завеликі або некоректні дані сайту")
		return
	}
	for k, values := range r.MultipartForm.Value {
		if len(values) != 1 || (k != "nazva" && k != "opis" && k != "url" && k != "vyd" && k != "revision") {
			drError(w, 400, "невірні дані сайту")
			return
		}
	}
	for k, files := range r.MultipartForm.File {
		if k != "file" || len(files) != 1 {
			drError(w, 400, "невірний скриншот")
			return
		}
	}
	name := strings.TrimSpace(r.FormValue("nazva"))
	description := r.FormValue("opis")
	address := syAddress(r.FormValue("url"))
	kind := r.FormValue("vyd")
	if !utf8.ValidString(name) || !utf8.ValidString(description) || strings.ContainsRune(name, 0) || strings.ContainsRune(description, 0) || utf8.RuneCountInString(name) < 1 || utf8.RuneCountInString(name) > 160 || utf8.RuneCountInString(description) > 5000 || address == "" || !syKind(kind) {
		drError(w, 400, "невірні дані сайту")
		return
	}
	revision := 0
	if r.Method == "PUT" {
		n, err := strconv.ParseInt(r.FormValue("revision"), 10, 32)
		if err != nil || n < 1 {
			drError(w, 400, "невірна ревізія сайту")
			return
		}
		revision = int(n)
		var author, current int
		e = db.QueryRow(ctx, `SELECT avtor_id,revision FROM public.saity WHERE id=$1`, id).Scan(&author, &current)
		if e == pgx.ErrNoRows {
			drError(w, 404, "сайт не знайдено")
			return
		}
		if e != nil {
			syDBError(w, e)
			return
		}
		if author != u {
			drError(w, 403, "редагувати сайт може лише автор")
			return
		}
		if current != revision {
			drError(w, 409, "запис уже змінено, онови каталог")
			return
		}
	} else if r.FormValue("revision") != "" {
		drError(w, 400, "невірні дані сайту")
		return
	}
	files := r.MultipartForm.File["file"]
	if r.Method == "POST" && len(files) != 1 {
		drError(w, 400, "додай скриншот сайту")
		return
	}
	newImage := ""
	retain := false
	defer func() {
		if newImage != "" && !retain {
			syDiscard(newImage)
		}
	}()
	if len(files) == 1 {
		newImage, e = syImage(ctx, files[0])
		if e != nil {
			drError(w, 400, e.Error())
			return
		}
	}
	tx, e := db.Begin(ctx)
	if e != nil {
		syDBError(w, e)
		return
	}
	defer tx.Rollback(context.Background())
	oldImage := ""
	if r.Method == "PUT" {
		var author, current int
		e = tx.QueryRow(ctx, `SELECT avtor_id,revision,skrin FROM public.saity WHERE id=$1 FOR UPDATE`, id).Scan(&author, &current, &oldImage)
		if e == pgx.ErrNoRows {
			drError(w, 404, "сайт не знайдено")
			return
		}
		if e != nil {
			syDBError(w, e)
			return
		}
		if author != u {
			drError(w, 403, "редагувати сайт може лише автор")
			return
		}
		if current != revision {
			drError(w, 409, "запис уже змінено, онови каталог")
			return
		}
		image := oldImage
		if newImage != "" {
			image = newImage
		}
		_, e = tx.Exec(ctx, `UPDATE public.saity SET nazva=$1,opis=$2,url=$3,vyd=$4,skrin=$5,revision=revision+1,updated_at=clock_timestamp() WHERE id=$6`, name, description, address, kind, image, id)
	} else {
		e = tx.QueryRow(ctx, `INSERT INTO public.saity(avtor_id,nazva,opis,url,vyd,skrin) VALUES($1,$2,$3,$4,$5,$6) RETURNING id`, u, name, description, address, kind, newImage).Scan(&id)
	}
	if e != nil {
		syDBError(w, e)
		return
	}
	item, e := syScan(tx.QueryRow(ctx, `SELECT `+syColumns+syFrom+` WHERE s.id=$1`, id))
	if e != nil {
		syDBError(w, e)
		return
	}
	retain = true
	if e = tx.Commit(ctx); e != nil {
		syDBError(w, e)
		return
	}
	if newImage != "" && oldImage != "" && newImage != oldImage {
		syUnlink(oldImage)
	}
	status := 200
	if r.Method == "POST" {
		status = 201
	}
	drJSON(w, status, item)
}
func syDelete(w http.ResponseWriter, r *http.Request) {
	u, ok := drAuth(w, r)
	if !ok || !sySame(w, r) {
		return
	}
	id, ok := syID(r, "id")
	rev, valid := syID(r, "revision")
	if !ok || !valid || rev > 2147483647 {
		drError(w, 400, "невірний сайт або ревізія")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()
	tx, e := db.Begin(ctx)
	if e != nil {
		syDBError(w, e)
		return
	}
	defer tx.Rollback(context.Background())
	var author, current int
	var image string
	e = tx.QueryRow(ctx, `SELECT avtor_id,revision,skrin FROM public.saity WHERE id=$1 FOR UPDATE`, id).Scan(&author, &current, &image)
	if e == pgx.ErrNoRows {
		drError(w, 404, "сайт не знайдено")
		return
	}
	if e != nil {
		syDBError(w, e)
		return
	}
	if author != u {
		drError(w, 403, "видалити сайт може лише автор")
		return
	}
	if int64(current) != rev {
		drError(w, 409, "запис уже змінено, онови каталог")
		return
	}
	if _, e = tx.Exec(ctx, `DELETE FROM public.saity WHERE id=$1`, id); e != nil {
		syDBError(w, e)
		return
	}
	if e = tx.Commit(ctx); e != nil {
		syDBError(w, e)
		return
	}
	syUnlink(image)
	drJSON(w, 200, map[string]bool{"ok": true})
}
func syCheck() bool {
	if len(os.Args) != 2 || os.Args[1] != "--saity-check" {
		return false
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	rows, e := db.Query(ctx, `SELECT id,avtor_id,nazva,opis,url,vyd,skrin,revision,created_at,updated_at FROM public.saity LIMIT 0`)
	if e == nil {
		rows.Close()
	}
	var ok bool
	if e == nil {
		e = db.QueryRow(ctx, `SELECT has_table_privilege(current_user,'public.saity','SELECT') AND has_table_privilege(current_user,'public.saity','INSERT') AND has_table_privilege(current_user,'public.saity','UPDATE') AND has_table_privilege(current_user,'public.saity','DELETE') AND has_sequence_privilege(current_user,pg_get_serial_sequence('public.saity','id'),'USAGE') AND EXISTS(SELECT 1 FROM pg_index WHERE indexrelid=to_regclass('public.saity_owner_url_unique') AND indrelid='public.saity'::regclass AND indisunique AND indisvalid)`).Scan(&ok)
	}
	if e != nil || !ok {
		fmt.Fprintln(os.Stderr, "saity: спочатку створи таблицю public.saity та індекси від ролі mriya_app")
		os.Exit(1)
	}
	for _, name := range []string{"ffmpeg", "ffprobe", "prlimit"} {
		if _, e = exec.LookPath(name); e != nil {
			fmt.Fprintln(os.Stderr, "saity: не знайдено "+name)
			os.Exit(1)
		}
	}
	if e = syStore(); e == nil {
		var f *os.File
		f, e = os.CreateTemp(syRoot, ".check-*")
		if e == nil {
			name := f.Name()
			f.Close()
			os.Remove(name)
		}
	}
	if e != nil {
		fmt.Fprintln(os.Stderr, "saity: немає доступу до dist/uploads/saity")
		os.Exit(1)
	}
	fmt.Println("saity: OK")
	return true
}

func pbmanage(w http.ResponseWriter,r *http.Request){
ctx,can,uid,ok:=pbw(w,r,"POST")
defer can()
if !ok{return}
var d struct{Cid int `json:"cid"`;Pid int `json:"pid"`;Uid int `json:"uid"`;Act string `json:"act"`}
if err:=pbd(w,r,&d);err!=nil{pbe(w,err);return}
if d.Cid<=0||d.Cid>2147483647||(d.Act!="pin"&&d.Act!="unpin"&&d.Act!="transfer"){pbe(w,&Pe{400,"невірна дія спільноти"});return}
if (d.Act=="transfer"&&(d.Uid<=0||d.Uid>2147483647||d.Pid!=0))||(d.Act!="transfer"&&(d.Pid<=0||d.Pid>2147483647||d.Uid!=0)){pbe(w,&Pe{400,"невірний ідентифікатор"});return}
tx,err:=db.Begin(ctx)
if err!=nil{pbe(w,err);return}
defer tx.Rollback(ctx)
var owner int
if err=tx.QueryRow(ctx,"SELECT owner_id FROM public.pabliks WHERE id=$1 FOR UPDATE",d.Cid).Scan(&owner);err!=nil{pbe(w,err);return}
if owner!=uid{pbe(w,&Pe{403,"тільки власник може змінювати спільноту"});return}
if d.Act=="transfer"{
var member bool
if d.Uid==uid{pbe(w,&Pe{400,"невірний ідентифікатор"});return}
if err=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.pablik_members m JOIN public.useri u ON u.id=m.uid WHERE m.cid=$1 AND m.uid=$2)",d.Cid,d.Uid).Scan(&member);err!=nil{pbe(w,err);return}
if !member{pbe(w,&Pe{400,"невірний ідентифікатор"});return}
if _,err=tx.Exec(ctx,"SELECT set_config('mriya.transfer_community',$1,true)",strconv.Itoa(d.Cid)+":"+strconv.Itoa(uid)+":"+strconv.Itoa(d.Uid));err==nil{_,err=tx.Exec(ctx,"UPDATE public.pabliks SET owner_id=$2,updated_at=NOW() WHERE id=$1",d.Cid,d.Uid)}
if err==nil{_,err=tx.Exec(ctx,"DELETE FROM public.pablik_write_blocks WHERE cid=$1 AND uid=$2",d.Cid,d.Uid)}
}else{
var exists bool
if err=tx.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.pablik_posts WHERE id=$1 AND cid=$2)",d.Pid,d.Cid).Scan(&exists);err!=nil{pbe(w,err);return}
if !exists{pbe(w,&Pe{404,"допис не знайдено"});return}
if d.Act=="pin"{_,err=tx.Exec(ctx,"INSERT INTO public.pablik_extras(cid,pinned_post_id) VALUES($1,$2) ON CONFLICT(cid) DO UPDATE SET pinned_post_id=EXCLUDED.pinned_post_id",d.Cid,d.Pid)}else{_,err=tx.Exec(ctx,"UPDATE public.pablik_extras SET pinned_post_id=NULL WHERE cid=$1 AND pinned_post_id=$2",d.Cid,d.Pid)}
}
if err!=nil{pbe(w,err);return}
g,err:=pbg(ctx,tx,d.Cid,uid)
if err!=nil{pbe(w,err);return}
if err=tx.Commit(ctx);err!=nil{pbe(w,err);return}
pbj(w,map[string]any{"ok":true,"community":g})
}

var asKey []byte
var asMailer=asSendMail
var asSweepMu sync.Mutex
var asSweepAt time.Time
var asDummy,_=bcrypt.GenerateFromPassword([]byte("invalid-login-timing"),10)
type asProblem struct{Status int;Message string;Retry int}
func(e *asProblem)Error()string{return e.Message}
func asProblemOut(w http.ResponseWriter,err error){
var p *asProblem
if !errors.As(err,&p){p=&asProblem{503,"не вдалося виконати запит",0}}
if p.Retry>0{w.Header().Set("Retry-After",strconv.Itoa(p.Retry))}
w.WriteHeader(p.Status)
json.NewEncoder(w).Encode(map[string]any{"error":p.Message,"retry_after":p.Retry})
}
func asBoot()error{
name:=os.Getenv("MRIYA_AUTH_KEY_FILE")
if name==""{exe,err:=os.Executable();if err!=nil{return fmt.Errorf("account security executable path is not available")};name=filepath.Join(filepath.Dir(exe),".mriya-auth-key")}
info,err:=os.Lstat(name)
if err!=nil{return fmt.Errorf("account security key is not available")}
if !info.Mode().IsRegular()||info.Mode().Perm()&0077!=0{return fmt.Errorf("account security key must be a private regular file")}
key,err:=os.ReadFile(name)
if err!=nil||len(key)!=64{return fmt.Errorf("account security key must contain 64 random bytes")}
asKey=key
st=sessions.NewCookieStore(key)
st.Options=&sessions.Options{Path:"/",MaxAge:86400*30,HttpOnly:true,Secure:true,SameSite:http.SameSiteLaxMode}
return nil
}
func asExpire(w http.ResponseWriter,r *http.Request){http.SetCookie(w,&http.Cookie{Name:"s",Value:"",Path:"/",MaxAge:-1,Expires:time.Unix(1,0),HttpOnly:true,Secure:true,SameSite:http.SameSiteLaxMode})}
func asSave(w http.ResponseWriter,r *http.Request,uid int,version int64)error{
s:=sessions.NewSession(st,"s")
s.Values["uid"]=uid
s.Values["av"]=version
s.Options=&sessions.Options{Path:"/",MaxAge:86400*30,HttpOnly:true,Secure:true,SameSite:http.SameSiteLaxMode}
return st.Save(r,w,s)
}
func asSessionGuard(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
s,err:=st.Get(r,"s")
if err!=nil{asExpire(w,r);next.ServeHTTP(w,r);return}
uid,ok:=s.Values["uid"].(int)
if !ok||uid<=0{next.ServeHTTP(w,r);return}
if r.URL.Path=="/api/login"||r.URL.Path=="/api/reg"||r.URL.Path=="/api/ver"||r.URL.Path=="/api/logout"||r.URL.Path=="/api/auth/capabilities"||r.URL.Path=="/api/auth/code"||r.URL.Path=="/api/auth/resend"{next.ServeHTTP(w,r);return}
version,valid:=s.Values["av"].(int64)
ctx,cancel:=context.WithTimeout(r.Context(),3*time.Second)
defer cancel()
var current int64
err=db.QueryRow(ctx,"SELECT auth_version FROM public.useri WHERE id=$1",uid).Scan(&current)
if err!=nil&&!errors.Is(err,pgx.ErrNoRows){w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");asProblemOut(w,&asProblem{503,"не вдалося виконати запит",0});return}
if !valid||err!=nil||version!=current{asExpire(w,r);w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");asProblemOut(w,&asProblem{401,"увійди знову",0});return}
next.ServeHTTP(w,r)
})}
func asUID(r *http.Request)(int,int64,error){
s,err:=st.Get(r,"s")
if err!=nil{return 0,0,&asProblem{401,"увійди знову",0}}
uid,a:=s.Values["uid"].(int);version,b:=s.Values["av"].(int64)
if !a||!b||uid<=0{return 0,0,&asProblem{401,"увійди знову",0}}
return uid,version,nil
}
func asStart(w http.ResponseWriter,r *http.Request,method string)bool{
w.Header().Set("Content-Type","application/json; charset=utf-8")
w.Header().Set("Cache-Control","no-store")
w.Header().Set("Pragma","no-cache")
if r.Method!=method{w.Header().Set("Allow",method);asProblemOut(w,&asProblem{405,"метод не дозволено",0});return false}
if method=="GET"{return true}
if r.Header.Get("Sec-Fetch-Site")=="cross-site"{asProblemOut(w,&asProblem{403,"запит з іншого сайту заборонено",0});return false}
origin:=r.Header.Get("Origin");ref:=false
if origin==""{origin=r.Header.Get("Referer");ref=true}
if origin!=""{u,err:=url.Parse(origin);if err!=nil||u.User!=nil||(u.Scheme!="https"&&u.Scheme!="http")||!strings.EqualFold(u.Host,r.Host)||(!ref&&(u.RawQuery!=""||u.Fragment!=""||(u.Path!=""&&u.Path!="/"))){asProblemOut(w,&asProblem{403,"запит з іншого сайту заборонено",0});return false}}
return true
}
func asRead(w http.ResponseWriter,r *http.Request,v any,strict bool)error{
if strict{mt,_,err:=mime.ParseMediaType(r.Header.Get("Content-Type"));if err!=nil||mt!="application/json"{return &asProblem{415,"невірні дані запиту",0}}}
r.Body=http.MaxBytesReader(w,r.Body,4096)
d:=json.NewDecoder(r.Body)
if strict{d.DisallowUnknownFields()}
if err:=d.Decode(v);err!=nil{return &asProblem{400,"невірні дані запиту",0}}
var extra any
if err:=d.Decode(&extra);err!=io.EOF{return &asProblem{400,"невірні дані запиту",0}}
return nil
}
func asIP(r *http.Request)string{
h,_,err:=net.SplitHostPort(r.RemoteAddr);if err!=nil{h=r.RemoteAddr}
ip:=net.ParseIP(h)
if ip!=nil&&ip.IsLoopback(){values:=strings.Split(r.Header.Get("X-Forwarded-For"),",");if len(values)>0{if v:=net.ParseIP(strings.TrimSpace(values[len(values)-1]));v!=nil{return v.String()}};if v:=net.ParseIP(strings.TrimSpace(r.Header.Get("X-Real-IP")));v!=nil{return v.String()}}
if ip!=nil{return ip.String()}
return "unknown"
}
func asDigest(s string)string{b:=sha256.Sum256([]byte(s));return hex.EncodeToString(b[:])}
func asCleanup(){
asSweepMu.Lock()
if time.Since(asSweepAt)<15*time.Minute{asSweepMu.Unlock();return}
asSweepAt=time.Now();asSweepMu.Unlock()
go func(){ctx,cancel:=context.WithTimeout(context.Background(),5*time.Second);defer cancel();db.Exec(ctx,"DELETE FROM public.auth_mail_codes WHERE token_hash IN(SELECT token_hash FROM public.auth_mail_codes WHERE expires_at<NOW()-INTERVAL '1 day' LIMIT 1000)");db.Exec(ctx,"DELETE FROM public.auth_mail_limits WHERE bucket IN(SELECT bucket FROM public.auth_mail_limits WHERE opened_at<NOW()-INTERVAL '2 days' LIMIT 1000)")}()
}
func asRate(ctx context.Context,bucket string,limit,seconds int)error{
var n int
err:=db.QueryRow(ctx,"INSERT INTO public.auth_mail_limits(bucket,n) VALUES($1,1) ON CONFLICT(bucket) DO UPDATE SET n=CASE WHEN auth_mail_limits.opened_at<=NOW()-($2::integer*INTERVAL '1 second') THEN 1 ELSE LEAST(auth_mail_limits.n+1,$3+1) END,opened_at=CASE WHEN auth_mail_limits.opened_at<=NOW()-($2::integer*INTERVAL '1 second') THEN NOW() ELSE auth_mail_limits.opened_at END RETURNING n",asDigest(bucket),seconds,limit).Scan(&n)
if err!=nil{return err}
if n>limit{return &asProblem{429,"забагато спроб, спробуй пізніше",seconds}}
return nil
}
func asSendSlot(ctx context.Context,tx pgx.Tx,uid int)error{
var n int
err:=tx.QueryRow(ctx,"INSERT INTO public.auth_mail_limits(bucket,n,last_sent) VALUES($1,1,NOW()) ON CONFLICT(bucket) DO UPDATE SET n=CASE WHEN auth_mail_limits.opened_at<=NOW()-INTERVAL '1 hour' THEN 1 ELSE auth_mail_limits.n+1 END,opened_at=CASE WHEN auth_mail_limits.opened_at<=NOW()-INTERVAL '1 hour' THEN NOW() ELSE auth_mail_limits.opened_at END,last_sent=NOW() WHERE (auth_mail_limits.last_sent IS NULL OR auth_mail_limits.last_sent<=NOW()-INTERVAL '60 seconds') AND (auth_mail_limits.opened_at<=NOW()-INTERVAL '1 hour' OR auth_mail_limits.n<8) RETURNING n",asDigest("send:"+strconv.Itoa(uid))).Scan(&n)
if errors.Is(err,pgx.ErrNoRows){return &asProblem{429,"зачекайте хвилину перед новою спробою; кількість листів обмежена",60}}
return err
}
func asRandom()(string,string,error){
b:=make([]byte,32)
if _,err:=rand.Read(b);err!=nil{return "","",err}
n,err:=rand.Int(rand.Reader,big.NewInt(1000000))
if err!=nil{return "","",err}
return base64.RawURLEncoding.EncodeToString(b),fmt.Sprintf("%06d",n.Int64()),nil
}
func asMAC(token,code,purpose string)string{m:=hmac.New(sha256.New,asKey);m.Write([]byte("mriya-mail-code-v1\x00"+purpose+"\x00"+token+"\x00"+code));return hex.EncodeToString(m.Sum(nil))}
func asEmail(email string)bool{a,err:=mail.ParseAddress(email);return err==nil&&a.Address==email&&len(email)<=100&&!strings.ContainsAny(email,"\r\n")}
func asHint(email string)string{at:=strings.LastIndex(email,"@");if at<1{return "***"};r:=[]rune(email[:at]);return string(r[0])+"***"+email[at:]}
func asMailText(purpose string)(string,string){switch purpose{case "login":return "Код входу до Мрії","підтвердження входу";case "password":return "Зміна пароля Мрії","підтвердження зміни пароля";case "2fa":return "Налаштування 2FA Мрії","підтвердження зміни налаштувань 2FA"};return "Код підтвердження Мрії","підтвердження реєстрації"}
func asDeliver(token,code,purpose,email string)error{
mac:=asMAC(token,code,purpose)
err:=asMailer(email,code,purpose)
ctx,cancel:=context.WithTimeout(context.Background(),5*time.Second);defer cancel()
if err!=nil{db.Exec(ctx,"DELETE FROM public.auth_mail_codes WHERE token_hash=$1 AND code_mac=$2",asDigest(token),mac);return &asProblem{503,"не вдалося надіслати лист, спробуй пізніше",60}}
tag,err:=db.Exec(ctx,"UPDATE public.auth_mail_codes SET ready=true WHERE token_hash=$1 AND code_mac=$2 AND expires_at>NOW()",asDigest(token),mac)
if err!=nil{return err}
if tag.RowsAffected()!=1{return &asProblem{400,"невірний код або термін дії минув",0}}
return nil
}
func asIssue(ctx context.Context,uid int,version int64,credential,purpose,payload string)(string,string,error){
token,code,err:=asRandom();if err!=nil{return "","",err}
tx,err:=db.Begin(ctx);if err!=nil{return "","",err};defer tx.Rollback(ctx)
var email,currentHash string;var current int64;var verified,enabled bool
err=tx.QueryRow(ctx,"SELECT COALESCE(poshta,''),passw,auth_version,COALESCE(iv,false),mae_2fa FROM public.useri WHERE id=$1 FOR UPDATE",uid).Scan(&email,&currentHash,&current,&verified,&enabled)
if err!=nil{return "","",err}
if current!=version||(credential!=""&&credential!=currentHash){return "","",&asProblem{401,"увійди знову",0}}
if !verified||!asEmail(email){return "","",&asProblem{409,"пошта не підтверджена",0}}
if purpose=="login"&&!enabled{return "","",&asProblem{409,"увійди знову",0}}
if purpose=="2fa"&&((payload=="on")==enabled){return "","",&asProblem{409,"налаштування вже змінено, онови панель",0}}
if err=asSendSlot(ctx,tx,uid);err!=nil{return "","",err}
_,err=tx.Exec(ctx,"INSERT INTO public.auth_mail_codes(token_hash,uid,purpose,code_mac,email,credential_hash,auth_version,payload,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW()+INTERVAL '5 minutes') ON CONFLICT(uid,purpose) DO UPDATE SET token_hash=EXCLUDED.token_hash,code_mac=EXCLUDED.code_mac,email=EXCLUDED.email,credential_hash=EXCLUDED.credential_hash,auth_version=EXCLUDED.auth_version,payload=EXCLUDED.payload,expires_at=EXCLUDED.expires_at,attempts=0,ready=false,created_at=NOW()",asDigest(token),uid,purpose,asMAC(token,code,purpose),email,currentHash,version,payload)
if err!=nil{return "","",err}
if err=tx.Commit(ctx);err!=nil{return "","",err}
if err=asDeliver(token,code,purpose,email);err!=nil{return "","",err}
return token,asHint(email),nil
}
func asLoginGate(w http.ResponseWriter,r *http.Request)bool{asLoginStart(w,r);return true}
func asLoginStart(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"POST"){return}
ctx,cancel:=context.WithTimeout(r.Context(),40*time.Second);defer cancel()
asCleanup()
if err:=asRate(ctx,"login-ip:"+asIP(r),90,900);err!=nil{asProblemOut(w,err);return}
var d struct{Login,Un,Passw,Ps string}
if err:=asRead(w,r,&d,false);err!=nil{asProblemOut(w,err);return}
un,pw:=strings.TrimSpace(d.Login),d.Passw;if un==""{un=strings.TrimSpace(d.Un)};if pw==""{pw=d.Ps}
if err:=asRate(ctx,"login-name:"+strings.ToLower(un),30,900);err!=nil{asProblemOut(w,err);return}
if un==""||len(un)>100||len(pw)>72||pw==""{asProblemOut(w,&asProblem{401,"невірний логін або пароль",0});return}
var id int;var hash string;var verified,enabled bool;var version int64
err:=db.QueryRow(ctx,"SELECT id,passw,COALESCE(iv,false),mae_2fa,auth_version FROM public.useri WHERE LOWER(username)=LOWER($1) OR LOWER(poshta)=LOWER($1)",un).Scan(&id,&hash,&verified,&enabled,&version)
if err!=nil{bcrypt.CompareHashAndPassword(asDummy,[]byte(pw));if !errors.Is(err,pgx.ErrNoRows){asProblemOut(w,err);return};asProblemOut(w,&asProblem{401,"невірний логін або пароль",0});return}
if bcrypt.CompareHashAndPassword([]byte(hash),[]byte(pw))!=nil{asProblemOut(w,&asProblem{401,"невірний логін або пароль",0});return}
if !verified{asProblemOut(w,&asProblem{403,"пошта не підтверджена",0});return}
if enabled{token,hint,err:=asIssue(ctx,id,version,hash,"login","");if err!=nil{asProblemOut(w,err);return};json.NewEncoder(w).Encode(map[string]any{"requires_2fa":true,"challenge":token,"email":hint,"expires_in":300,"retry_after":60});return}
if err=asSave(w,r,id,version);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"id":id})
}
func asCapabilities(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"GET"){return}
ctx,cancel:=context.WithTimeout(r.Context(),3*time.Second);defer cancel()
var ready bool
err:=db.QueryRow(ctx,"SELECT to_regclass('public.auth_mail_codes') IS NOT NULL AND to_regclass('public.auth_mail_limits') IS NOT NULL AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='useri' AND column_name='mae_2fa' AND data_type='boolean') AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='useri' AND column_name='auth_version' AND data_type='bigint')").Scan(&ready)
if err!=nil||!ready||len(asKey)!=64{asProblemOut(w,&asProblem{503,"не вдалося виконати запит",0});return}
json.NewEncoder(w).Encode(map[string]any{"version":1,"email_2fa":true,"password_confirmation":true,"session_version":true})
}
func asSettings(w http.ResponseWriter,r *http.Request){
method:=r.Method;if method!="GET"{method="POST"};if !asStart(w,r,method){return}
uid,version,err:=asUID(r);if err!=nil{asProblemOut(w,err);return}
ctx,cancel:=context.WithTimeout(r.Context(),40*time.Second);defer cancel()
if r.Method=="GET"{var enabled bool;var email string;var current int64;var verified bool;err=db.QueryRow(ctx,"SELECT mae_2fa,COALESCE(poshta,''),auth_version,COALESCE(iv,false) FROM public.useri WHERE id=$1",uid).Scan(&enabled,&email,&current,&verified);if err!=nil{asProblemOut(w,err);return};if current!=version{asProblemOut(w,&asProblem{401,"увійди знову",0});return};json.NewEncoder(w).Encode(map[string]any{"ok":true,"mae_2fa":enabled,"email":asHint(email),"email_verified":verified&&asEmail(email)});return}
var d struct{Action string `json:"action"`;Password string `json:"new_password"`;Enabled *bool `json:"enabled"`}
if err=asRead(w,r,&d,true);err!=nil{asProblemOut(w,err);return}
if d.Action!="password"&&d.Action!="2fa"{asProblemOut(w,&asProblem{400,"невірні дані запиту",0});return}
if err=asRate(ctx,"settings:"+strconv.Itoa(uid),20,3600);err!=nil{asProblemOut(w,err);return}
payload:=""
if d.Action=="password"{if d.Enabled!=nil||!utf8.ValidString(d.Password)||utf8.RuneCountInString(d.Password)<6||len(d.Password)>72{asProblemOut(w,&asProblem{400,"пароль: від 6 символів, не більше 72 байтів",0});return};hash,e:=bcrypt.GenerateFromPassword([]byte(d.Password),10);if e!=nil{asProblemOut(w,e);return};payload=string(hash)}else{if d.Enabled==nil||d.Password!=""{asProblemOut(w,&asProblem{400,"невірні дані запиту",0});return};payload="off";if *d.Enabled{payload="on"}}
token,hint,err:=asIssue(ctx,uid,version,"",d.Action,payload);if err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"challenge":token,"email":hint,"expires_in":300,"retry_after":60})
}
func asToken(s string)bool{b,err:=base64.RawURLEncoding.DecodeString(s);return err==nil&&len(b)==32&&len(s)==43}
func asVerify(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"POST"){return}
ctx,cancel:=context.WithTimeout(r.Context(),15*time.Second);defer cancel()
if err:=asRate(ctx,"verify-ip:"+asIP(r),120,600);err!=nil{asProblemOut(w,err);return}
var d struct{Challenge string `json:"challenge"`;Code string `json:"code"`}
if err:=asRead(w,r,&d,true);err!=nil{asProblemOut(w,err);return}
d.Code=strings.TrimSpace(d.Code)
if !asToken(d.Challenge)||len(d.Code)!=6||strings.IndexFunc(d.Code,func(c rune)bool{return c<'0'||c>'9'})>=0{asProblemOut(w,&asProblem{400,"невірний код або термін дії минув",0});return}
tx,err:=db.Begin(ctx);if err!=nil{asProblemOut(w,err);return};defer tx.Rollback(ctx)
invalid:=func(){asProblemOut(w,&asProblem{400,"невірний код або термін дії минув",0})}
var uid int
if err=tx.QueryRow(ctx,"SELECT uid FROM public.auth_mail_codes WHERE token_hash=$1",asDigest(d.Challenge)).Scan(&uid);err!=nil{if errors.Is(err,pgx.ErrNoRows){invalid()}else{asProblemOut(w,err)};return}
var current int64;var email,hash string;var enabled,verified bool
if err=tx.QueryRow(ctx,"SELECT auth_version,COALESCE(poshta,''),passw,mae_2fa,COALESCE(iv,false) FROM public.useri WHERE id=$1 FOR UPDATE",uid).Scan(&current,&email,&hash,&enabled,&verified);err!=nil{invalid();return}
var purpose,mac,storedEmail,credential,payload string;var version int64;var attempts int;var expires time.Time;var ready bool
err=tx.QueryRow(ctx,"SELECT purpose,code_mac,email,credential_hash,auth_version,payload,attempts,expires_at,ready FROM public.auth_mail_codes WHERE token_hash=$1 AND uid=$2 FOR UPDATE",asDigest(d.Challenge),uid).Scan(&purpose,&mac,&storedEmail,&credential,&version,&payload,&attempts,&expires,&ready)
if err!=nil{invalid();return}
if !ready||attempts>=5||!expires.After(time.Now())||version!=current||email!=storedEmail||credential!=hash||!verified||(purpose=="login"&&!enabled){invalid();return}
if purpose!="login"{sessionUID,sessionVersion,e:=asUID(r);if e!=nil||sessionUID!=uid||sessionVersion!=current{asProblemOut(w,&asProblem{401,"увійди знову",0});return}}
if !hmac.Equal([]byte(mac),[]byte(asMAC(d.Challenge,d.Code,purpose))){_,err=tx.Exec(ctx,"UPDATE public.auth_mail_codes SET attempts=attempts+1 WHERE token_hash=$1",asDigest(d.Challenge));if err==nil{err=tx.Commit(ctx)};if err!=nil{asProblemOut(w,err)}else{invalid()};return}
if purpose=="password"{if _,e:=bcrypt.Cost([]byte(payload));e!=nil{invalid();return};err=tx.QueryRow(ctx,"UPDATE public.useri SET passw=$2,auth_version=auth_version+1 WHERE id=$1 RETURNING auth_version",uid,payload).Scan(&current)}else if purpose=="2fa"{if payload!="on"&&payload!="off"{invalid();return};enabled=payload=="on";err=tx.QueryRow(ctx,"UPDATE public.useri SET mae_2fa=$2,auth_version=auth_version+1 WHERE id=$1 RETURNING auth_version",uid,enabled).Scan(&current)}
if err!=nil{asProblemOut(w,err);return}
if purpose=="login"{_,err=tx.Exec(ctx,"DELETE FROM public.auth_mail_codes WHERE token_hash=$1",asDigest(d.Challenge))}else{_,err=tx.Exec(ctx,"DELETE FROM public.auth_mail_codes WHERE uid=$1",uid)}
if err!=nil{asProblemOut(w,err);return}
if err=tx.Commit(ctx);err!=nil{asProblemOut(w,err);return}
if err=asSave(w,r,uid,current);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"id":uid,"mae_2fa":enabled,"action":purpose})
}
func asResend(w http.ResponseWriter,r *http.Request){
if !asStart(w,r,"POST"){return}
ctx,cancel:=context.WithTimeout(r.Context(),40*time.Second);defer cancel()
if err:=asRate(ctx,"resend-ip:"+asIP(r),60,600);err!=nil{asProblemOut(w,err);return}
var d struct{Challenge string `json:"challenge"`}
if err:=asRead(w,r,&d,true);err!=nil{asProblemOut(w,err);return}
if !asToken(d.Challenge){asProblemOut(w,&asProblem{400,"невірний код або термін дії минув",0});return}
tx,err:=db.Begin(ctx);if err!=nil{asProblemOut(w,err);return};defer tx.Rollback(ctx)
invalid:=func(){asProblemOut(w,&asProblem{400,"невірний код або термін дії минув",0})}
var uid int
if err=tx.QueryRow(ctx,"SELECT uid FROM public.auth_mail_codes WHERE token_hash=$1",asDigest(d.Challenge)).Scan(&uid);err!=nil{invalid();return}
var version int64;var email,hash string;var verified,enabled bool
if err=tx.QueryRow(ctx,"SELECT auth_version,COALESCE(poshta,''),passw,COALESCE(iv,false),mae_2fa FROM public.useri WHERE id=$1 FOR UPDATE",uid).Scan(&version,&email,&hash,&verified,&enabled);err!=nil{invalid();return}
var purpose,storedEmail,credential,oldMAC string;var saved int64;var attempts int;var created time.Time
err=tx.QueryRow(ctx,"SELECT purpose,email,credential_hash,auth_version,attempts,created_at,code_mac FROM public.auth_mail_codes WHERE token_hash=$1 AND uid=$2 FOR UPDATE",asDigest(d.Challenge),uid).Scan(&purpose,&storedEmail,&credential,&saved,&attempts,&created,&oldMAC)
if err!=nil||saved!=version||storedEmail!=email||credential!=hash||!verified||attempts>=5||time.Since(created)>15*time.Minute||(purpose=="login"&&!enabled){invalid();return}
if purpose!="login"{sessionUID,sessionVersion,e:=asUID(r);if e!=nil||sessionUID!=uid||sessionVersion!=version{asProblemOut(w,&asProblem{401,"увійди знову",0});return}}
if err=asSendSlot(ctx,tx,uid);err!=nil{asProblemOut(w,err);return}
code:=""
for{var e error;_,code,e=asRandom();if e!=nil{asProblemOut(w,e);return};if !hmac.Equal([]byte(oldMAC),[]byte(asMAC(d.Challenge,code,purpose))){break}}
_,err=tx.Exec(ctx,"UPDATE public.auth_mail_codes SET code_mac=$2,expires_at=NOW()+INTERVAL '5 minutes',ready=false WHERE token_hash=$1",asDigest(d.Challenge),asMAC(d.Challenge,code,purpose))
if err==nil{err=tx.Commit(ctx)};if err!=nil{asProblemOut(w,err);return}
if err=asDeliver(d.Challenge,code,purpose,email);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"email":asHint(email),"expires_in":300,"retry_after":60})
}

func igHandle(w http.ResponseWriter,r *http.Request){
if r.Method!="GET"&&r.Method!="POST"{w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");w.Header().Set("Allow","GET, POST");asProblemOut(w,&asProblem{405,"метод не дозволено",0});return}
if !asStart(w,r,r.Method){return}
uid,version,err:=asUID(r)
if err!=nil{asProblemOut(w,err);return}
if r.URL.RawQuery!=""{asProblemOut(w,&asProblem{400,"параметри користувача передавати не потрібно",0});return}
ctx,cancel:=context.WithTimeout(r.Context(),5*time.Second);defer cancel()
if r.Method=="GET"{
var data []byte
err=db.QueryRow(ctx,`SELECT jsonb_build_object('ok',true,'selected',(SELECT jsonb_build_object('pic',g.pic,'label',g.label) FROM public.galki g WHERE g.uid=u.id),'items',COALESCE((SELECT jsonb_agg(jsonb_build_object('pic',i.pic,'label',i.label,'selected',EXISTS(SELECT 1 FROM public.galki g WHERE g.uid=u.id AND g.pic=i.pic AND g.label=i.label)) ORDER BY i.pic COLLATE "C",i.label COLLATE "C") FROM public.invgalki i WHERE i.uid=u.id),'[]'::jsonb)) FROM public.useri u WHERE u.id=$1 AND u.auth_version=$2`,uid,version).Scan(&data)
if errors.Is(err,pgx.ErrNoRows){asProblemOut(w,&asProblem{401,"увійди знову",0});return}
if err!=nil{asProblemOut(w,err);return}
w.Write(data)
return
}
var d struct{Pic string `json:"pic"`;Label *string `json:"label"`}
if err=asRead(w,r,&d,true);err!=nil{asProblemOut(w,err);return}
if strings.TrimSpace(d.Pic)==""||strings.ContainsAny(d.Pic,"/\\\x00")||d.Pic=="."||d.Pic==".."||d.Label==nil||strings.ContainsRune(*d.Label,0){asProblemOut(w,&asProblem{400,"вкажи картинку та підпис галочки з інвентарю",0});return}
tx,err:=db.Begin(ctx)
if err!=nil{asProblemOut(w,err);return}
defer tx.Rollback(ctx)
var current int64
err=tx.QueryRow(ctx,"SELECT auth_version FROM public.useri WHERE id=$1 FOR UPDATE",uid).Scan(&current)
if errors.Is(err,pgx.ErrNoRows)||(err==nil&&current!=version){asProblemOut(w,&asProblem{401,"увійди знову",0});return}
if err!=nil{asProblemOut(w,err);return}
var pic,label string
err=tx.QueryRow(ctx,"SELECT pic,label FROM public.invgalki WHERE uid=$1 AND pic=$2 AND label=$3 FOR SHARE",uid,d.Pic,*d.Label).Scan(&pic,&label)
if errors.Is(err,pgx.ErrNoRows){asProblemOut(w,&asProblem{403,"цієї галочки немає у твоєму інвентарі",0});return}
if err!=nil{asProblemOut(w,err);return}
_,err=tx.Exec(ctx,"INSERT INTO public.galki(uid,pic,label) VALUES($1,$2,$3) ON CONFLICT(uid) DO UPDATE SET pic=EXCLUDED.pic,label=EXCLUDED.label",uid,pic,label)
if err!=nil{asProblemOut(w,err);return}
if err=tx.Commit(ctx);err!=nil{asProblemOut(w,err);return}
json.NewEncoder(w).Encode(map[string]any{"ok":true,"selected":map[string]string{"pic":pic,"label":label}})
}

type RpKind struct{Key string;Label string;Table string;Alias string;From string;Where string;Text string;Image string;Parent string;Stamp string}
var rpKinds=[]RpKind{
{"post","дописи","posts","p","public.posts p JOIN public.useri u ON u.id=p.avtor_id LEFT JOIN public.galki g ON g.uid=u.id ",`(`+pvs+`)`,"COALESCE(p.text,'')","COALESCE(p.pics[1],p.gif,'')","0","jsonb_build_array(p.text,p.pics,p.gif,p.geo,p.vidimist,p.misto,p.mx_coauthor_id)"},
{"comment","коментарі","comments","c","public.comments c JOIN public.useri u ON u.id=c.uid LEFT JOIN public.galki g ON g.uid=u.id JOIN public.posts p ON p.id=c.pid",`(`+pvs+`) AND NOT c.del`,"c.text","COALESCE(c.pics[1],NULLIF(c.gif,''),'')","c.pid","jsonb_build_array(c.text,c.pics,c.gif,c.geo,c.del)"},
{"flash","флеш","flash","f","public.flash f JOIN public.useri u ON u.id=f.uid LEFT JOIN public.galki g ON g.uid=u.id ","(true)","f.na","''","0","jsonb_build_array(f.na,f.fl)"},
{"community","спільноти","pabliks","c","public.pabliks c JOIN public.useri u ON u.id=c.owner_id LEFT JOIN public.galki g ON g.uid=u.id ","(true)","c.name||' '||c.bio","c.photo","0","jsonb_build_array(c.name,c.bio,c.photo,c.banner,c.owner_id)"},
{"community_post","дописи спільнот","pablik_posts","p","public.pablik_posts p JOIN public.useri u ON u.id=p.avtor_id LEFT JOIN public.galki g ON g.uid=u.id JOIN public.pabliks b ON b.id=p.cid","(true)","p.text","COALESCE(p.pics[1],NULLIF(p.gif,''),'')","p.cid","jsonb_build_array(p.text,p.pics,p.gif,p.geo,p.cid,p.mx_coauthor_id)"},
{"suggestion","пропоновки","pablik_suggestions","s","public.pablik_suggestions s JOIN public.useri u ON u.id=s.avtor_id LEFT JOIN public.galki g ON g.uid=u.id JOIN public.pabliks b ON b.id=s.cid","(b.owner_id=$1 AND s.status='pending')","s.text","COALESCE(s.pics[1],NULLIF(s.gif,''),'')","s.cid","jsonb_build_array(s.text,s.pics,s.gif,s.geo,s.cid,s.status,s.mx_coauthor_id)"},
{"music","музика","music","m","public.music m JOIN public.useri u ON u.id=m.uploader LEFT JOIN public.galki g ON g.uid=u.id ","(true)","m.nazva||' '||m.author||' '||COALESCE(m.opis,'')","''","0","jsonb_build_array(m.nazva,m.author,m.albom,m.opis,m.genre,m.failik,m.godvipuska)"},
{"video","відео","videos","v","public.videos v JOIN public.useri u ON u.id=v.avtor_id LEFT JOIN public.galki g ON g.uid=u.id ","(v.status='ready' OR v.avtor_id=$1)","v.nazva||' '||v.opis","CASE WHEN v.preview<>'' THEN '/api/video-previews/'||v.preview ELSE '' END","0","jsonb_build_array(v.nazva,v.opis,v.status,v.failik,v.source,v.preview)"},
{"video_comment","коментарі до відео","video_comments","c","public.video_comments c JOIN public.useri u ON u.id=c.avtor_id LEFT JOIN public.galki g ON g.uid=u.id JOIN public.videos v ON v.id=c.vid","(v.status='ready' OR v.avtor_id=$1)","c.text","''","c.vid","jsonb_build_array(c.text,c.parent_id,c.vid)"},
{"site","сайти","saity","s","public.saity s JOIN public.useri u ON u.id=s.avtor_id LEFT JOIN public.galki g ON g.uid=u.id ","(true)","s.nazva||' '||s.opis||' '||s.url","s.skrin","0","jsonb_build_array(s.nazva,s.opis,s.url,s.skrin,s.vyd)"},
}
type RpQ interface{Query(context.Context,string,...any)(pgx.Rows,error);QueryRow(context.Context,string,...any)pgx.Row}
type RpTarget struct{ID int64 `json:"id"`;Kind string `json:"kind"`;Text string `json:"text"`;Media []string `json:"media"`;Image string `json:"image"`;Parent int64 `json:"parent"`;Version string `json:"version"`;Author map[string]any `json:"author"`;Href string `json:"href"`}
func rpKind(s string)(RpKind,bool){for _,k:=range rpKinds{if k.Key==s{return k,true}};return RpKind{},false}
func rpCut(s string,n int)string{v:=[]rune(s);if len(v)>n{return string(v[:n])};return s}
func rpValid(s string,n int)bool{return utf8.ValidString(s)&&!strings.ContainsRune(s,0)&&utf8.RuneCountInString(s)<=n}
func rpID(s string)(int64,error){n,e:=strconv.ParseInt(s,10,64);if e!=nil||n<1||n>9007199254740991{return 0,&Pe{400,"невірні дані запиту"}};return n,nil}
func rpHex(s string)bool{b,e:=hex.DecodeString(s);return e==nil&&len(b)==32&&s==strings.ToLower(s)}
func rpMedia(k RpKind)string{a:=k.Alias;switch k.Key{case "post","comment","community_post","suggestion":return "to_jsonb(array_remove("+a+".pics||ARRAY["+a+".gif],''))";case "flash":return "jsonb_build_array(f.fl)";case "music":return "jsonb_build_array(m.failik)";case "video":return "CASE WHEN v.status='ready' AND v.failik<>'' THEN jsonb_build_array('/api/video-files/'||v.failik) ELSE '[]'::jsonb END";case "community":return "jsonb_build_array(c.photo,c.banner)"};return "'[]'::jsonb"}
func rpSelect(k RpKind)string{extra:="";if k.Key=="comment"{extra=" AND NOT c.del "};return "SELECT "+k.Alias+".id::bigint,COALESCE("+k.Text+",''),COALESCE("+k.Image+",''),("+k.Parent+")::bigint,("+k.Stamp+")::text,u.id,u.username,COALESCE(u.photo,''),COALESCE(u.frame,''),COALESCE(g.pic,''),COALESCE(g.label,''),"+rpMedia(k)+" FROM "+k.From+" WHERE $1::int>=0 "+extra+" AND (("+k.Where+") OR $2::boolean) AND ($3::bigint=0 OR "+k.Alias+".id=$3) AND ($4::bigint=0 OR "+k.Alias+".id<$4) AND ($5::text='' OR strpos(lower(COALESCE("+k.Text+",'')||' '||u.username),lower($5))>0) "}
func rpScan(row interface{Scan(...any)error},k RpKind)(RpTarget,error){var t RpTarget;var raw,un,ph,fr,pic,label string;var author int;e:=row.Scan(&t.ID,&t.Text,&t.Image,&t.Parent,&raw,&author,&un,&ph,&fr,&pic,&label,&t.Media);if e!=nil{return t,e};h:=sha256.Sum256([]byte(raw));t.Version=hex.EncodeToString(h[:]);t.Kind=k.Key;t.Author=map[string]any{"id":author,"username":un,"photo":ph,"frame":fr,"galka":makeGalka(pic,label)};id:=strconv.FormatInt(t.ID,10);pa:=strconv.FormatInt(t.Parent,10);switch k.Key{case "post":t.Href="/#comments/"+id;case "comment":t.Href="/#comments/"+pa;case "community":t.Href="/#communities/"+id;case "community_post":t.Href="/#communities/"+pa+"/post/"+id;case "suggestion":t.Href="/#communities/"+pa;case "flash":t.Href="/#flash";case "music":t.Href="/#music";case "video":t.Href="/?video="+id+"#videos";case "video_comment":t.Href="/?video="+pa+"#videos";case "site":t.Href="/#saity"};return t,nil}
func rpTarget(ctx context.Context,q RpQ,k RpKind,id int64,uid int,review bool,lock bool)(RpTarget,error){sql:=rpSelect(k)+"ORDER BY "+k.Alias+".id DESC LIMIT 1";if lock{sql+=" FOR UPDATE OF "+k.Alias};return rpScan(q.QueryRow(ctx,sql,uid,review,id,int64(0),""),k)}
func rpMod(ctx context.Context,q RpQ,uid int)(bool,error){if uid<=0{return false,nil};var ok bool;e:=q.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.galki WHERE uid=$1 AND label IN ('Модератор','Головний адміністратор'))",uid).Scan(&ok);return ok,e}
func rpError(w http.ResponseWriter,e error){var p *Pe;if errors.As(e,&p){rpJSON(w,p.St,map[string]any{"error":p.Msg});return};if errors.Is(e,pgx.ErrNoRows){rpJSON(w,404,map[string]any{"error":"контент недоступний або видалений"});return};fmt.Fprintf(os.Stderr,"reports: %v\n",e);rpJSON(w,503,map[string]any{"error":"сервіс тимчасово недоступний"})}
func rpJSON(w http.ResponseWriter,status int,v any){w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store");w.Header().Set("X-Content-Type-Options","nosniff");w.WriteHeader(status);json.NewEncoder(w).Encode(v)}
func rpRead(w http.ResponseWriter,r *http.Request,v any)error{if r.Header.Get("Sec-Fetch-Site")=="cross-site"{return &Pe{403,"немає доступу"}};o:=r.Header.Get("Origin");ref:=false;if o==""{o=r.Header.Get("Referer");ref=true};if o!=""{u,e:=url.Parse(o);if e!=nil||u.User!=nil||(u.Scheme!="https"&&u.Scheme!="http")||!strings.EqualFold(u.Host,r.Host)||(!ref&&(u.RawQuery!=""||u.Fragment!=""||(u.Path!=""&&u.Path!="/"))){return &Pe{403,"немає доступу"}}};mt,_,e:=mime.ParseMediaType(r.Header.Get("Content-Type"));if e!=nil||mt!="application/json"{return &Pe{415,"невірні дані запиту"}};d:=json.NewDecoder(http.MaxBytesReader(w,r.Body,64<<10));d.DisallowUnknownFields();if e=d.Decode(v);e!=nil{return &Pe{400,"невірні дані запиту"}};var extra any;if d.Decode(&extra)!=io.EOF{return &Pe{400,"невірні дані запиту"}};return nil}
func rpParent(ctx context.Context,tx pgx.Tx,k RpKind,id int64)error{var parent int64;var table string;var e error;switch k.Key{case "comment":e=tx.QueryRow(ctx,"SELECT pid FROM public.comments WHERE id=$1",id).Scan(&parent);table="posts";case "community_post","suggestion":e=tx.QueryRow(ctx,"SELECT cid FROM public."+k.Table+" WHERE id=$1",id).Scan(&parent);table="pabliks";case "video_comment":e=tx.QueryRow(ctx,"SELECT vid FROM public.video_comments WHERE id=$1",id).Scan(&parent);table="videos";default:return nil};if e!=nil{return e};return tx.QueryRow(ctx,"SELECT id FROM public."+table+" WHERE id=$1 FOR UPDATE",parent).Scan(&parent)}
const rpReportSQL=`SELECT jsonb_build_object('id',r.id,'author_id',COALESCE(r.author_id,0),'author',jsonb_build_object('id',COALESCE(u.id,0),'username',COALESCE(u.username,''),'photo',COALESCE(u.photo,''),'frame',COALESCE(u.frame,''),'galka',CASE WHEN COALESCE(g.pic,'')='' THEN NULL ELSE jsonb_build_object('pic',g.pic,'label',COALESCE(g.label,'')) END),'kind',r.kind,'target_id',r.target_id,'title',r.title,'body',r.body,'target_version',r.target_version,'status',r.status,'reason',r.reason,'reviewer_id',COALESCE(r.reviewer_id,0),'reviewer_name',r.reviewer_name,'created_at',r.created_at,'resolved_at',r.resolved_at) FROM public.mriya_reports r LEFT JOIN public.useri u ON u.id=r.author_id LEFT JOIN public.galki g ON g.uid=u.id `
func rpOne(ctx context.Context,id int64,uid int,mod bool)(map[string]any,error){var v map[string]any;e:=db.QueryRow(ctx,rpReportSQL+"WHERE r.id=$1",id).Scan(&v);if e!=nil{return nil,e};rpAttach(ctx,v,uid,mod);return v,nil}
func rpNumber(v any)int64{switch n:=v.(type){case int64:return n;case int:return int64(n);case int32:return int64(n);case float64:return int64(n);case json.Number:i,_:=n.Int64();return i};return 0}
func rpAttach(ctx context.Context,v map[string]any,uid int,mod bool){v["target"]=nil;k,ok:=rpKind(fmt.Sprint(v["kind"]));if !ok{return};id:=rpNumber(v["target_id"]);if id<1{return};t,e:=rpTarget(ctx,db,k,id,uid,mod,false);if e==nil{v["target"]=t}else if !errors.Is(e,pgx.ErrNoRows){fmt.Fprintf(os.Stderr,"reports target: %v\n",e)}}
func rpMeta(w http.ResponseWriter,r *http.Request,ctx context.Context,uid int){mod,e:=rpMod(ctx,db,uid);if e!=nil{rpError(w,e);return};kinds:=make([]map[string]string,0);for _,k:=range rpKinds{var exists bool;if e=db.QueryRow(ctx,"SELECT to_regclass($1) IS NOT NULL","public."+k.Table).Scan(&exists);e!=nil{rpError(w,e);return};if exists{kinds=append(kinds,map[string]string{"key":k.Key,"label":k.Label})}};var me any;if uid>0{var un,ph,fr,pic,label string;e=db.QueryRow(ctx,"SELECT u.username,COALESCE(u.photo,''),COALESCE(u.frame,''),COALESCE(g.pic,''),COALESCE(g.label,'') FROM public.useri u LEFT JOIN public.galki g ON g.uid=u.id WHERE u.id=$1",uid).Scan(&un,&ph,&fr,&pic,&label);if e!=nil{rpError(w,e);return};me=map[string]any{"id":uid,"username":un,"photo":ph,"frame":fr,"galka":makeGalka(pic,label)}};rpJSON(w,200,map[string]any{"version":1,"me":me,"moderator":mod,"kinds":kinds})}
func rpTargets(w http.ResponseWriter,r *http.Request,ctx context.Context,uid int){k,ok:=rpKind(r.URL.Query().Get("kind"));if !ok{rpError(w,&Pe{400,"невірні дані запиту"});return};q:=r.URL.Query().Get("q");if !rpValid(q,200){rpError(w,&Pe{400,"невірні дані запиту"});return};var before int64;var e error;if v:=r.URL.Query().Get("before");v!=""{before,e=rpID(v);if e!=nil{rpError(w,e);return}};rows,e:=db.Query(ctx,rpSelect(k)+"ORDER BY "+k.Alias+".id DESC LIMIT 51",uid,false,int64(0),before,q);if e!=nil{rpError(w,e);return};defer rows.Close();items:=make([]RpTarget,0);for rows.Next(){t,er:=rpScan(rows,k);if er!=nil{rpError(w,er);return};items=append(items,t)};if e=rows.Err();e!=nil{rpError(w,e);return};var next any;if len(items)>50{items=items[:50];next=strconv.FormatInt(items[len(items)-1].ID,10)};rpJSON(w,200,map[string]any{"items":items,"next":next})}
func rpList(w http.ResponseWriter,r *http.Request,ctx context.Context,uid int){mod,e:=rpMod(ctx,db,uid);if e!=nil{rpError(w,e);return};if raw:=r.URL.Query().Get("id");raw!=""{id,er:=rpID(raw);if er!=nil{rpError(w,er);return};v,er:=rpOne(ctx,id,uid,mod);if er!=nil{rpError(w,er)}else{rpJSON(w,200,v)};return};filter:=r.URL.Query().Get("status");if filter!=""&&filter!="pending"&&filter!="accepted"&&filter!="rejected"{rpError(w,&Pe{400,"невірні дані запиту"});return};var before int64;if v:=r.URL.Query().Get("before");v!=""{before,e=rpID(v);if e!=nil{rpError(w,e);return}};rows,e:=db.Query(ctx,rpReportSQL+"WHERE ($1::bigint=0 OR r.id<$1) AND ($2::text='' OR r.status=$2) ORDER BY r.id DESC LIMIT 21",before,filter);if e!=nil{rpError(w,e);return};items:=make([]map[string]any,0);for rows.Next(){var v map[string]any;if e=rows.Scan(&v);e!=nil{break};items=append(items,v)};if e==nil{e=rows.Err()};rows.Close();if e!=nil{rpError(w,e);return};var next any;if len(items)>20{items=items[:20];next=strconv.FormatInt(rpNumber(items[len(items)-1]["id"]),10)};for _,v:=range items{rpAttach(ctx,v,uid,mod)};rpJSON(w,200,map[string]any{"items":items,"next":next,"moderator":mod})}
func rpCreate(w http.ResponseWriter,r *http.Request,ctx context.Context,uid int){var d struct{Kind string `json:"kind"`;Target int64 `json:"target_id"`;Version string `json:"version"`;Title string `json:"title"`;Body string `json:"body"`;Key string `json:"key"`};if e:=rpRead(w,r,&d);e!=nil{rpError(w,e);return};k,ok:=rpKind(d.Kind);d.Title=strings.TrimSpace(d.Title);d.Body=strings.TrimSpace(d.Body);if !ok||d.Target<1||d.Target>9007199254740991||!rpHex(d.Version)||!vbuuid(d.Key)||!rpValid(d.Title,160)||!rpValid(d.Body,5000)||d.Title==""||d.Body==""{rpError(w,&Pe{400,"невірні дані запиту"});return};var old int64;e:=db.QueryRow(ctx,"SELECT id FROM public.mriya_reports WHERE author_id=$1 AND request_key=$2::uuid",uid,d.Key).Scan(&old);if e==nil{v,er:=rpOne(ctx,old,uid,false);if er!=nil{rpError(w,er)}else{rpJSON(w,200,v)};return};if !errors.Is(e,pgx.ErrNoRows){rpError(w,e);return};if e=asRate(ctx,"reports:create:"+strconv.Itoa(uid),5,600);e!=nil{asProblemOut(w,e);return};tx,e:=db.Begin(ctx);if e!=nil{rpError(w,e);return};defer tx.Rollback(context.Background());if _,e=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(736291,$1)",uid);e!=nil{rpError(w,e);return};t,e:=rpTarget(ctx,tx,k,d.Target,uid,false,false);if e!=nil{rpError(w,e);return};if t.Version!=d.Version{rpError(w,&Pe{409,"контент змінено; онови вибір"});return};var duplicate int64;e=tx.QueryRow(ctx,"SELECT id FROM public.mriya_reports WHERE author_id=$1 AND ((kind=$2 AND target_id=$3 AND status='pending') OR request_key=$4::uuid) ORDER BY id LIMIT 1",uid,d.Kind,d.Target,d.Key).Scan(&duplicate);if e==nil{if er:=tx.Commit(ctx);er!=nil{rpError(w,er);return};v,er:=rpOne(ctx,duplicate,uid,false);if er!=nil{rpError(w,er)}else{rpJSON(w,200,v)};return};if !errors.Is(e,pgx.ErrNoRows){rpError(w,e);return};var id int64;e=tx.QueryRow(ctx,"INSERT INTO public.mriya_reports(author_id,kind,target_id,title,body,target_version,request_key) VALUES($1,$2,$3,$4,$5,$6,$7::uuid) RETURNING id",uid,d.Kind,d.Target,d.Title,d.Body,d.Version,d.Key).Scan(&id);if e==nil{e=tx.Commit(ctx)};if e!=nil{rpError(w,e);return};v,e:=rpOne(ctx,id,uid,false);if e!=nil{rpError(w,e);return};rpJSON(w,201,v)}
func rpQueue(ctx context.Context,tx pgx.Tx,kind,name string)error{if name==""{return nil};_,e:=tx.Exec(ctx,"INSERT INTO public.mriya_reports_gc(kind,name) VALUES($1,$2) ON CONFLICT DO NOTHING",kind,name);return e}
func rpDelete(ctx context.Context,tx pgx.Tx,k RpKind,t RpTarget)error{var e error;switch k.Key{case "comment":_,e=tx.Exec(ctx,"UPDATE public.comments SET text='',pics='{}',gif='',geo='',del=TRUE,ua=clock_timestamp() WHERE id=$1 AND NOT del",t.ID);return e;case "music":var name string;e=tx.QueryRow(ctx,"SELECT failik FROM public.music WHERE id=$1",t.ID).Scan(&name);if e==nil{e=rpQueue(ctx,tx,"music",name)};case "video":var src,out,prev string;e=tx.QueryRow(ctx,"SELECT source,failik,preview FROM public.videos WHERE id=$1",t.ID).Scan(&src,&out,&prev);if e==nil{e=rpQueue(ctx,tx,"video_src",src)};if e==nil{e=rpQueue(ctx,tx,"video_out",out)};if e==nil{e=rpQueue(ctx,tx,"video_preview",prev)};case "site":var image string;e=tx.QueryRow(ctx,"SELECT skrin FROM public.saity WHERE id=$1",t.ID).Scan(&image);if e==nil{e=rpQueue(ctx,tx,"site",image)}};if e!=nil{return e};_,e=tx.Exec(ctx,"DELETE FROM public."+k.Table+" WHERE id=$1",t.ID);return e}
func rpReview(w http.ResponseWriter,r *http.Request,ctx context.Context,uid int){var d struct{ID int64 `json:"id"`;Act string `json:"act"`;Reason string `json:"reason"`;Version string `json:"version"`};if e:=rpRead(w,r,&d);e!=nil{rpError(w,e);return};d.Reason=strings.TrimSpace(d.Reason);if d.ID<1||d.ID>9007199254740991||(d.Act!="accept"&&d.Act!="reject")||!rpValid(d.Reason,2000)||(d.Act=="reject"&&d.Reason=="")||(d.Act=="accept"&&!rpHex(d.Version)){rpError(w,&Pe{400,"невірні дані запиту"});return};tx,e:=db.Begin(ctx);if e!=nil{rpError(w,e);return};defer tx.Rollback(context.Background());var label,username string;e=tx.QueryRow(ctx,"SELECT g.label,u.username FROM public.galki g JOIN public.useri u ON u.id=g.uid WHERE g.uid=$1 FOR SHARE OF g,u",uid).Scan(&label,&username);if errors.Is(e,pgx.ErrNoRows)||(e==nil&&label!="Модератор"&&label!="Головний адміністратор"){rpError(w,&Pe{403,"немає доступу"});return};if e!=nil{rpError(w,e);return};var author int;var kind,status string;var id int64;e=tx.QueryRow(ctx,"SELECT COALESCE(author_id,0),kind,target_id,status FROM public.mriya_reports WHERE id=$1 FOR UPDATE",d.ID).Scan(&author,&kind,&id,&status);if e!=nil{rpError(w,e);return};if author==uid{rpError(w,&Pe{403,"не можна розглядати власний репорт"});return};if status!="pending"{rpError(w,&Pe{409,"репорт уже розглянуто"});return};k,ok:=rpKind(kind);if !ok{rpError(w,&Pe{400,"невірні дані запиту"});return};status="rejected";if d.Act=="accept"{if e=rpParent(ctx,tx,k,id);e!=nil{rpError(w,e);return};t,er:=rpTarget(ctx,tx,k,id,uid,true,true);if er!=nil{rpError(w,er);return};if t.Version!=d.Version{rpError(w,&Pe{409,"контент змінено; онови вибір"});return};if e=rpDelete(ctx,tx,k,t);e!=nil{rpError(w,e);return};status="accepted"};_,e=tx.Exec(ctx,"UPDATE public.mriya_reports SET status=$2,reason=$3,reviewer_id=$4,reviewer_name=$5,reviewed_version=$6,resolved_at=clock_timestamp() WHERE id=$1",d.ID,status,d.Reason,uid,username,d.Version);if e==nil{e=tx.Commit(ctx)};if e!=nil{rpError(w,e);return};if d.Act=="accept"&&kind=="video"{vbmu.Lock();if cancel:=vbjobs[id];cancel!=nil{cancel()};vbmu.Unlock()};go rpGC();v,e:=rpOne(ctx,d.ID,uid,true);if e!=nil{rpError(w,e);return};rpJSON(w,200,v)}
var rpGCMu sync.Mutex
func rpGC(){if !rpGCMu.TryLock(){return};defer rpGCMu.Unlock();ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second);defer cancel();rows,e:=db.Query(ctx,"SELECT id,kind,name FROM public.mriya_reports_gc ORDER BY id LIMIT 50");if e!=nil{return};type item struct{id int64;kind,name string};var items []item;for rows.Next(){var v item;if rows.Scan(&v.id,&v.kind,&v.name)==nil{items=append(items,v)}};rows.Close();for _,v:=range items{var path,query string;var arg any=v.name;valid:=false;switch v.kind{case "music":name:=strings.TrimPrefix(v.name,"/music-files/");valid=v.name=="/music-files/"+name&&mun(name);path=filepath.Join(mdr,name);query="SELECT EXISTS(SELECT 1 FROM public.music WHERE failik=$1)";case "site":name:=strings.TrimPrefix(v.name,"/uploads/saity/");b,er:=hex.DecodeString(strings.TrimSuffix(name,".png"));valid=v.name=="/uploads/saity/"+name&&strings.HasSuffix(name,".png")&&len(name)==52&&er==nil&&len(b)==24;path=filepath.Join(syRoot,name);query="SELECT EXISTS(SELECT 1 FROM public.saity WHERE skrin=$1)";case "video_src":valid=vbname(v.name,".src");path=filepath.Join(vbd,"src",v.name);query="SELECT EXISTS(SELECT 1 FROM public.videos WHERE source=$1)";case "video_out":valid=vbname(v.name,".mp4");path=filepath.Join(vbd,"out",v.name);query="SELECT EXISTS(SELECT 1 FROM public.videos WHERE failik=$1)";case "video_preview":valid=vbname(v.name,".webp");path=filepath.Join(vbd,"previews",v.name);query="SELECT EXISTS(SELECT 1 FROM public.videos WHERE preview=$1)"};if !valid{fmt.Fprintln(os.Stderr,"reports cleanup: invalid stored filename");continue};var used bool;if db.QueryRow(ctx,query,arg).Scan(&used)!=nil{continue};if used{continue};if e=os.Remove(path);e!=nil&&!os.IsNotExist(e){fmt.Fprintln(os.Stderr,"reports cleanup:",e);continue};db.Exec(ctx,"DELETE FROM public.mriya_reports_gc WHERE id=$1",v.id)}}
func rpLoop(){for{rpGC();time.Sleep(time.Minute)}}
func rpHandle(w http.ResponseWriter,r *http.Request){ctx,cancel:=context.WithTimeout(r.Context(),15*time.Second);defer cancel();s,e:=st.Get(r,"s");uid:=0;if e==nil{uid,_=s.Values["uid"].(int)};if uid<0{uid=0};if r.Method=="GET"{switch r.URL.Query().Get("op"){case "meta":rpMeta(w,r,ctx,uid);case "targets":rpTargets(w,r,ctx,uid);case "":rpList(w,r,ctx,uid);default:rpError(w,&Pe{400,"невірні дані запиту"})};return};if r.Method!="POST"&&r.Method!="PUT"{w.Header().Set("Allow","GET, POST, PUT");rpError(w,&Pe{405,"метод не підтримується"});return};if uid<=0{rpError(w,&Pe{401,"увійди знову"});return};var exists bool;if e=db.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.useri WHERE id=$1)",uid).Scan(&exists);e!=nil{rpError(w,e);return};if !exists{rpError(w,&Pe{401,"увійди знову"});return};if r.Method=="POST"{rpCreate(w,r,ctx,uid)}else{rpReview(w,r,ctx,uid)}}

type NsTable struct{Name string;Cols []string;Keys []string}
type NsEdge struct{Child string;Parent string;Cols []string;Refs []string;Act string}
func nsTables(ctx context.Context,q Pq)([]NsTable,[]NsEdge,error){
rows,e:=q.Query(ctx,`SELECT c.relname,array_agg(a.attname::text ORDER BY a.attnum),COALESCE((SELECT array_agg(pa.attname::text ORDER BY k.n) FROM pg_index i CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(v,n) JOIN pg_attribute pa ON pa.attrelid=c.oid AND pa.attnum=k.v WHERE i.indrelid=c.oid AND i.indisprimary),'{}'::text[]) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped WHERE n.nspname='public' AND c.relkind='r' AND c.relname NOT IN ('native_files','mriya_reports_gc') GROUP BY c.oid,c.relname ORDER BY c.relname`)
if e!=nil{return nil,nil,e};var tables []NsTable;for rows.Next(){var t NsTable;if e=rows.Scan(&t.Name,&t.Cols,&t.Keys);e!=nil{rows.Close();return nil,nil,e};tables=append(tables,t)};e=rows.Err();rows.Close();if e!=nil{return nil,nil,e}
rows,e=q.Query(ctx,`SELECT ch.relname,pa.relname,array_agg(ca.attname::text ORDER BY k.n),array_agg(ra.attname::text ORDER BY k.n),f.confdeltype::text FROM pg_constraint f JOIN pg_class ch ON ch.oid=f.conrelid JOIN pg_class pa ON pa.oid=f.confrelid JOIN pg_namespace cn ON cn.oid=ch.relnamespace JOIN pg_namespace pn ON pn.oid=pa.relnamespace CROSS JOIN LATERAL unnest(f.conkey,f.confkey) WITH ORDINALITY k(c,r,n) JOIN pg_attribute ca ON ca.attrelid=ch.oid AND ca.attnum=k.c JOIN pg_attribute ra ON ra.attrelid=pa.oid AND ra.attnum=k.r WHERE f.contype='f' AND cn.nspname='public' AND pn.nspname='public' GROUP BY f.oid,ch.relname,pa.relname,f.confdeltype ORDER BY ch.relname,pa.relname`)
if e!=nil{return nil,nil,e};var edges []NsEdge;for rows.Next(){var f NsEdge;if e=rows.Scan(&f.Child,&f.Parent,&f.Cols,&f.Refs,&f.Act);e!=nil{rows.Close();return nil,nil,e};edges=append(edges,f)};e=rows.Err();rows.Close();return tables,edges,e
}
func nsIdent(s string)string{return pgx.Identifier{s}.Sanitize()}
func nsMatch(t NsTable,alias string)string{if len(t.Keys)==0{return alias+".ctid::text=d.loc"};v:=[]string{};for _,k:=range t.Keys{v=append(v,"to_jsonb("+alias+")->"+"'"+strings.ReplaceAll(k,"'","''")+"'=d.body->'"+strings.ReplaceAll(k,"'","''")+"'")};return strings.Join(v," AND ")}
func nsOwn(t NsTable)[]string{
known:=map[string]string{"posts":"avtor_id","flash":"uid","comments":"uid","pabliks":"owner_id","pablik_posts":"avtor_id","pablik_suggestions":"avtor_id","music":"uploader","videos":"avtor_id","video_comments":"avtor_id","saity":"avtor_id","hostingsites":"uid","askmr_pytannia":"avtor_id","askmr_vidpovidi":"avtor_id","mriya_reports":"author_id"}
if k:=known[t.Name];k!=""{for _,c:=range t.Cols{if c==k{return []string{k}}}}
return nil
}
func nsDelete(ctx context.Context,tx pgx.Tx,uid int)error{
tables,edges,e:=nsTables(ctx,tx);if e!=nil{return e};by:=map[string]NsTable{};selected:=map[string]bool{"useri":true};for _,t:=range tables{by[t.Name]=t;if len(nsOwn(t))>0{selected[t.Name]=true}}
for change:=true;change;{change=false;for _,f:=range edges{if selected[f.Parent]&&f.Act!="n"&&f.Act!="d"&&!selected[f.Child]{selected[f.Child]=true;change=true}}}
for _,t:=range tables{if selected[t.Name]{if _,e=tx.Exec(ctx,"LOCK TABLE public."+nsIdent(t.Name)+" IN SHARE ROW EXCLUSIVE MODE");e!=nil{return e}}}
if _,e=tx.Exec(ctx,`CREATE TEMP TABLE ns_d(rel TEXT NOT NULL,loc TEXT NOT NULL,body JSONB NOT NULL,PRIMARY KEY(rel,loc)) ON COMMIT DROP`);e!=nil{return e}
if _,e=tx.Exec(ctx,`INSERT INTO ns_d SELECT 'useri',ctid::text,to_jsonb(t) FROM public.useri t WHERE id=$1`,uid);e!=nil{return e}
for _,t:=range tables{for _,col:=range nsOwn(t){if _,e=tx.Exec(ctx,"INSERT INTO ns_d SELECT $1,t.ctid::text,to_jsonb(t) FROM public."+nsIdent(t.Name)+" t WHERE "+nsIdent(col)+"=$2 ON CONFLICT DO NOTHING",t.Name,uid);e!=nil{return e}}}
for step:=0;step<100;step++{var added int64;for _,f:=range edges{if !selected[f.Parent]||!selected[f.Child]||f.Act=="n"||f.Act=="d"{continue};terms:=[]string{};for i,c:=range f.Cols{terms=append(terms,"to_jsonb(t)->'"+strings.ReplaceAll(c,"'","''")+"'=d.body->'"+strings.ReplaceAll(f.Refs[i],"'","''")+"'")};tag,er:=tx.Exec(ctx,"INSERT INTO ns_d SELECT $1,t.ctid::text,to_jsonb(t) FROM public."+nsIdent(f.Child)+" t JOIN ns_d d ON d.rel=$2 AND "+strings.Join(terms," AND ")+" ON CONFLICT DO NOTHING",f.Child,f.Parent);if er!=nil{return er};added+=tag.RowsAffected()};if added==0{break};if step==99{return errors.New("account dependency depth exceeded")}}
rows,e:=tx.Query(ctx,"SELECT rel,body FROM ns_d");if e!=nil{return e};type record struct{rel string;data map[string]any};var records []record;for rows.Next(){var v record;var b []byte;if e=rows.Scan(&v.rel,&b);e!=nil{rows.Close();return e};if e=json.Unmarshal(b,&v.data);e!=nil{rows.Close();return e};records=append(records,v)};e=rows.Err();rows.Close();if e!=nil{return e}
for _,v:=range records{if e=nsFiles(ctx,tx,v.rel,v.data);e!=nil{return e}}
remaining:=map[string]bool{};for k:=range selected{if k!="useri"{remaining[k]=true}}
for round:=0;len(remaining)>0&&round<100;round++{progress:=false;for i:=len(tables)-1;i>=0;i--{t:=tables[i];if !remaining[t.Name]{continue};if _,e=tx.Exec(ctx,"SAVEPOINT ns_try");e!=nil{return e};_,e=tx.Exec(ctx,"DELETE FROM public."+nsIdent(t.Name)+" t USING ns_d d WHERE d.rel=$1 AND "+nsMatch(t,"t"),t.Name);if e!=nil{var pe interface{SQLState()string};if !errors.As(e,&pe)||pe.SQLState()!="23503"{return e};if _,e=tx.Exec(ctx,"ROLLBACK TO SAVEPOINT ns_try");e!=nil{return e}}else{delete(remaining,t.Name);progress=true};if _,e=tx.Exec(ctx,"RELEASE SAVEPOINT ns_try");e!=nil{return e}};if !progress{return errors.New("account has unsupported dependent records")}}
if len(remaining)>0{return errors.New("account dependency cycle")}
_,e=tx.Exec(ctx,"DELETE FROM public.useri WHERE id=$1",uid);return e
}
func nsQueue(ctx context.Context,tx pgx.Tx,kind,name string)error{if name==""{return nil};_,e:=tx.Exec(ctx,"INSERT INTO public.native_files(kind,name) VALUES($1,$2) ON CONFLICT DO NOTHING",kind,name);return e}
var nsURL=regexp.MustCompile(`/(?:uploads|music-files|api/profile-music)/[^\s\[\]<>"'\\]+`)
func nsFiles(ctx context.Context,tx pgx.Tx,table string,v map[string]any)error{
var walk func(any)error;walk=func(x any)error{switch a:=x.(type){case string:for _,path:=range nsURL.FindAllString(a,-1){if e:=nsQueue(ctx,tx,"url",path);e!=nil{return e}};case []any:for _,b:=range a{if e:=walk(b);e!=nil{return e}};case map[string]any:for _,b:=range a{if e:=walk(b);e!=nil{return e}}};return nil};if e:=walk(v);e!=nil{return e}
if table=="videos"{for col,kind:=range map[string]string{"source":"video_src","failik":"video_out","preview":"video_preview"}{if s,ok:=v[col].(string);ok{if e:=nsQueue(ctx,tx,kind,s);e!=nil{return e}}}}
if table=="hostingsites"{b,e:=json.Marshal(v);if e!=nil{return e};return nsQueue(ctx,tx,"hosting",string(b))};return nil
}
func nsHandle(w http.ResponseWriter,r *http.Request){
w.Header().Set("Content-Type","application/json; charset=utf-8");w.Header().Set("Cache-Control","no-store")
method:=r.Method;if method!="GET"&&method!="PUT"&&method!="DELETE"{w.Header().Set("Allow","GET, PUT, DELETE");asProblemOut(w,&asProblem{405,"метод не дозволено",0});return};if !asStart(w,r,method){return}
if method=="GET"&&r.URL.Query().Get("capabilities")=="1"{json.NewEncoder(w).Encode(map[string]any{"revision":"native-settings-1","hidden":true,"delete":true});return}
uid,version,e:=asUID(r);if e!=nil{asProblemOut(w,e);return};ctx,can:=context.WithTimeout(r.Context(),35*time.Second);defer can()
if method=="GET"{var hidden bool;e=db.QueryRow(ctx,"SELECT COALESCE((SELECT hidden FROM public.native_settings WHERE uid=u.id),false) FROM public.useri u WHERE u.id=$1 AND u.auth_version=$2",uid,version).Scan(&hidden);if e!=nil{asProblemOut(w,e);return};json.NewEncoder(w).Encode(map[string]any{"hidden":hidden});return}
var d struct{Hidden *bool `json:"hidden"`;Password string `json:"password"`};if e=asRead(w,r,&d,true);e!=nil{asProblemOut(w,e);return}
if method=="PUT"{if d.Hidden==nil||d.Password!=""{asProblemOut(w,&asProblem{400,"невірні дані запиту",0});return};if e=asRate(ctx,"native:hidden:"+strconv.Itoa(uid),60,600);e!=nil{asProblemOut(w,e);return};var current int64;tx,er:=db.Begin(ctx);if er!=nil{asProblemOut(w,er);return};defer tx.Rollback(context.Background());e=tx.QueryRow(ctx,"SELECT auth_version FROM public.useri WHERE id=$1 FOR UPDATE",uid).Scan(&current);if e==nil&&current!=version{e=&asProblem{401,"увійди знову",0}};if e==nil{_,e=tx.Exec(ctx,"INSERT INTO public.native_settings(uid,hidden) VALUES($1,$2) ON CONFLICT(uid) DO UPDATE SET hidden=EXCLUDED.hidden",uid,*d.Hidden)};if e==nil{e=tx.Commit(ctx)};if e!=nil{asProblemOut(w,e);return};json.NewEncoder(w).Encode(map[string]any{"hidden":*d.Hidden});return}
if d.Hidden!=nil||len(d.Password)<1||len(d.Password)>72{asProblemOut(w,&asProblem{400,"введи пароль",0});return};if e=asRate(ctx,"native:delete:"+strconv.Itoa(uid),5,900);e!=nil{asProblemOut(w,e);return};var hash string;var current int64;e=db.QueryRow(ctx,"SELECT passw,auth_version FROM public.useri WHERE id=$1",uid).Scan(&hash,&current);if e!=nil{asProblemOut(w,e);return};if current!=version{asProblemOut(w,&asProblem{401,"увійди знову",0});return};if bcrypt.CompareHashAndPassword([]byte(hash),[]byte(d.Password))!=nil{asProblemOut(w,&asProblem{403,"невірний пароль",0});return}
tx,e:=db.Begin(ctx);if e!=nil{asProblemOut(w,e);return};defer tx.Rollback(context.Background());if _,e=tx.Exec(ctx,"SET LOCAL lock_timeout='5s'");e==nil{_,e=tx.Exec(ctx,"SELECT pg_advisory_xact_lock(73519320)")};if e==nil{e=nsDelete(ctx,tx,uid)};if e==nil{var lockedHash string;var lockedVersion int64;e=tx.QueryRow(ctx,"SELECT body->>'passw',(body->>'auth_version')::bigint FROM ns_d WHERE rel='useri'").Scan(&lockedHash,&lockedVersion);if e==nil&&(lockedHash!=hash||lockedVersion!=version){e=&asProblem{409,"дані акаунта змінилися, повтори запит",0}}};if e==nil{e=tx.Commit(ctx)};if e!=nil{asProblemOut(w,e);return};asExpire(w,r);json.NewEncoder(w).Encode(map[string]bool{"ok":true});go nsCleanup()
}
var nsCleanup=nsGC
var nsShared=errors.New("file still referenced")
var nsMu sync.Mutex
func nsSafe(root,path string)(string,bool){base,e:=filepath.Abs(root);if e!=nil{return "",false};p,e:=filepath.Abs(path);if e!=nil||!strings.HasPrefix(p,base+string(os.PathSeparator)){return "",false};rel,e:=filepath.Rel(base,p);if e!=nil{return "",false};cur:=base;st,e:=os.Lstat(cur);if e!=nil||!st.IsDir()||st.Mode()&os.ModeSymlink!=0{return "",false};parts:=strings.Split(rel,string(os.PathSeparator));for i,n:=range parts{cur=filepath.Join(cur,n);st,e=os.Lstat(cur);if os.IsNotExist(e){return p,true};if e!=nil||st.Mode()&os.ModeSymlink!=0||i<len(parts)-1&&!st.IsDir(){return "",false}};return p,true}
func nsUsed(ctx context.Context,needle string)(bool,error){tables,_,e:=nsTables(ctx,db);if e!=nil{return true,e};for _,t:=range tables{var used bool;e=db.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public."+nsIdent(t.Name)+" t WHERE strpos(to_jsonb(t)::text,$1)>0)",needle).Scan(&used);if e!=nil||used{return true,e}};return false,nil}
func nsGC(){if !nsMu.TryLock(){return};defer nsMu.Unlock();ctx,can:=context.WithTimeout(context.Background(),25*time.Second);defer can();rows,e:=db.Query(ctx,"SELECT kind,name FROM public.native_files ORDER BY created_at LIMIT 100");if e!=nil{return};type item struct{k,n string};var items []item;for rows.Next(){var v item;if rows.Scan(&v.k,&v.n)==nil{items=append(items,v)}};e=rows.Err();rows.Close();if e!=nil{return};for _,v:=range items{if e=nsClean(ctx,v.k,v.n);e!=nil{if !errors.Is(e,nsShared){fmt.Fprintln(os.Stderr,"account cleanup:",e)};continue};db.Exec(ctx,"DELETE FROM public.native_files WHERE kind=$1 AND name=$2",v.k,v.n)}}
func nsClean(ctx context.Context,kind,name string)error{
if kind=="hosting"{var v struct{Id int `json:"id"`;Adres string `json:"adres"`};if e:=json.Unmarshal([]byte(name),&v);e!=nil{return e};if v.Id<1||!hsAddress(v.Adres){return errors.New("invalid hosting cleanup")};var exists bool;if e:=db.QueryRow(ctx,"SELECT EXISTS(SELECT 1 FROM public.hostingsites WHERE id=$1)",v.Id).Scan(&exists);e!=nil{return e};if exists{return nil};if e:=hsRemove(ctx,hsSite{Id:v.Id,Adres:v.Adres});e!=nil{return e};p,ok:=nsSafe(hsHome,filepath.Join(hsHome,strconv.Itoa(v.Id)));if !ok{return errors.New("unsafe hosting path")};return os.RemoveAll(p)}
used,e:=nsUsed(ctx,name);if e!=nil{return e};if used{return nsShared};var root,path string
switch kind{case "url":u,e:=url.Parse(name);if e!=nil||u.RawQuery!=""||u.Fragment!=""||u.IsAbs()||u.Host!=""||u.Path!=name||strings.ContainsAny(name,"\\\x00\r\n"){return errors.New("invalid upload path")};switch{case strings.HasPrefix(name,"/uploads/"):root="dist/uploads";path=filepath.Join(root,strings.TrimPrefix(name,"/uploads/"));case strings.HasPrefix(name,"/music-files/"):root=mdr;path=filepath.Join(root,strings.TrimPrefix(name,"/music-files/"));case strings.HasPrefix(name,"/api/profile-music/"):root=profileMusicDir;path=filepath.Join(root,strings.TrimPrefix(name,"/api/profile-music/"));default:return errors.New("unknown upload path")};case "video_src":if !vbname(name,".src"){return errors.New("invalid video filename")};root=filepath.Join(vbd,"src");path=filepath.Join(root,name);case "video_out":if !vbname(name,".mp4"){return errors.New("invalid video filename")};root=filepath.Join(vbd,"out");path=filepath.Join(root,name);case "video_preview":if !vbname(name,".webp"){return errors.New("invalid video filename")};root=filepath.Join(vbd,"previews");path=filepath.Join(root,name);default:return errors.New("unknown account cleanup kind")}
p,ok:=nsSafe(root,path);if !ok{return errors.New("unsafe account cleanup path")};st,e:=os.Lstat(p);if os.IsNotExist(e){return nil};if e!=nil{return e};if !st.Mode().IsRegular(){return errors.New("upload is not a regular file")};e=os.Remove(p);if os.IsNotExist(e){return nil};return e
}
func nsLoop(){for{nsGC();time.Sleep(time.Minute)}}
