ооот, меньше ніж місяць ковиряння і приблизно рік після того як бренд мрія взагалі виник, і ми відкриваємо сторінку на гітхабі

це точно не тому що нам ліньки робити обнови і живіть там самі. коли буде час, обнову зробимо, як робили і раніше. а поки це просто подарунок, бо така обіцянка вже звучала і пора її закрити

попередження одразу. автор криворукий довбойоб. в коді є певна частина, написана ші автоматично, але переважна більшість зроблена людськими руками, і відповідальність за все однаково одна

код кривий, тож коментарів, відступів і всього подібного, що зазвичай прийнято додавати, не чекайте, їх там нема. розбирайтесь самі, це частина досвіду
що де лежить. в директорії backend один файл main.go, це весь бекенд, разом з роутами, базою, поштою і сесіями. в директорії frontend лежить цілий фронт, src з компонентами і public з асетами, збірка стандартна через npm. в директорії rust окремий сервіс стрічки. в корені ще .env.example та schema.sql 

підключається все через змінні оточення, жодних секретів в коді нема. потрібні MRIYA_DSN для postgres, MRIYA_SMTP_HOST, MRIYA_SMTP_USER і MRIYA_SMTP_PASS для листів з кодами підтвердження, MRIYA_SESSION_KEY для кук, MRIYA_AUTH_KEY_FILE для шляху до ключа. в .env.example ті самі назви зі смішними значеннями, свої підставите самі

що треба на машині??: postgres 16 або новіший разом з пакетом contrib, go 1.26 або новіший, node 20.19 або новіший, rust з cargo, openssl. на ubuntu і debian це
sudo apt install postgresql postgresql-contrib nodejs npm rustc cargo openssl

на fedora це, і там ще треба ініціалізувати кластер
sudo dnf install postgresql-server postgresql-contrib nodejs golang rust cargo openssl
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

без postgresql-contrib не буде pgcrypto, і схема впаде на першому ж рядку. go з пакета може бути старший за потрібний, тоді він сам стягне свій тулчейн, якщо мережа відкрита. ffmpeg і ffprobe потрібні тільки для обробки відео, на старт бекенда їх відсутність не впливає, він лише напише про це в stderr

крок 1, спочатку роль, потім база з власником, потім схема, і саме в такому порядку. в postgres 15 і новіших схема public належить власнику бази, тому якщо вантажити схему від postgres, а застосунок пускати від іншої ролі, ви отримаєте permission denied for schema public на кожній з 42 таблицььььь:

sudo -u postgres psql -c "create role mriya login password 'mriya'"
sudo -u postgres createdb -O mriya mriya
sudo -u postgres psql -d mriya -c "create extension if not exists pgcrypto"

на fedora вхід по tcp за замовчуванням стоїть на ident, тобто з паролем не пустить, тому міняємо на scram і перезавантажуємо

sudo sed -i 's/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl reload postgresql

на ubuntu і debian той файл лежить в /etc/postgresql/версія/main/pg_hba.conf і там зазвичай уже scram-sha-256, просто перевірте

крок 2,схему вантажимо від імені тієї самої ролі, яка потім буде в .env, інакше таблиці будуть чужі і застосунок не зможе їх мігрувати на старті

git clone https://github.com/mriynick/mriya
cd mriya
cp schema.sql /tmp/schema.sql
chmod 644 /tmp/schema.sql
psql "postgres://mriya:mriya@localhost:5432/mriya" -f /tmp/schema.sql
psql "postgres://mriya:mriya@localhost:5432/mriya" -tAc "select count(*) from information_schema.tables where table_schema = 'public'"

останній рядок має показати 42. якщо менше, помилки вище написані чесно, читайте їх

крок 3,бекенд не вміє сам читати .env, він бере все через os.Getenv, тому файл треба або експортувати в сесію перед запуском, або покласти в systemd як EnvironmentFile

cp .env.example .env

далі заповнити MRIYA_DSN своєю адресою бази, MRIYA_SMTP_HOST, MRIYA_SMTP_USER і MRIYA_SMTP_PASS своїм поштовим сервером, якщо хочете, щоб коди підтвердження приходили листами. ключ сесії згенерувати так (АБО ЯКЩО ВАМ ЛІНЬКИ РОБИТИ СМТП ТА ВИ ХОЧЕТЕ ПРОСТО СТВОРЮВАТИ АКАУНТИ ЗМІНЮЙТЕ БЕКЕНД, АБО ЗАКОМЕНТУЙТЕ ЧАСТИНУ З ПОТРЕБОЮ ПІДТВЕРДЖЕННЯ АКАУНТУ АБО ПІДТВЕРДЖУЙТЕ АКАУНТИ ОДРАЗУ ПІСЛЯ РЕЄСТРАЦІЇ)

openssl rand -hex 32

крок 4,main.go читає MRIYA_AUTH_KEY_FILE, а якщо змінної немає, шукає файл .mriya-auth-key поруч з бінарником. файл має бути рівно 64 байти і з правами 600, інакше бекенд відмовиться стартувати

cd backend
openssl rand 64 > .mriya-auth-key
chmod 600 .mriya-auth-key

крок 5, збірка бекенда. перша збірка мовчки тягне модулі з мережі одну три хвилини і виглядає як зависання, не переривайте її, далі все з кешу

go build -o mriya main.go

крок 6,можна перейти до фронту (не донецького) prebuild сам згенерує списки емодзі й стикерів і напише Emoji 94 і Stickeri 74, тому нічого додатково запускати не треба. готовий dist кладеться туди, звідки стартує бінарник, бо бекенд віддає статику з відносної папки ./dist і сам закриває собою і api, і фронт, окремий веб-сервер не потрібен

cd ../frontend
npm install
npm run build
cp -r dist ../backend/dist

попередження про чанк більший за 500 кб це не помилка, це lang.js, він важкий через велику кількість мов там

крок 7, директорії, які в коді прописані як сталі. для форка їх треба або створити, або поміняти константи в main.go

cd ..
sudo mkdir -p /opt/mriya/backend/strichka /opt/mriya/backend/profile-music /opt/mriya/backend/music-files /opt/mriya/backend/video-files /opt/mriya/frontend/public/frames /srv/mriya-hosting/sites /srv/mriya-hosting/journal
sudo cp -r frontend/public/frames/. /opt/mriya/frontend/public/frames/
sudo chown -R $USER /opt/mriya/backend /srv/mriya-hosting

рядок 991 у main.go це сокет стрічки, 1566 рамки аватарок, 1606 музика в профілі, 3102 і 3103 це хостинг у /srv, 3180 музичні файли, 4450 відеофайли, а 3104 це зовнішній бінар mriya-hosting-link, якого в репо немає, тому хостинг-посилання (наприклад mriya.ink/testtt.ink) у форку працювати не будуть, поки ви не напишете свій

крок 8, стрічка. це окремий раст сервіс, він читає dsn з файла, шлях до якого береться зі змінної STRICHKA_DATABASE_FILE, а не з поточної папки. без цієї змінної він впаде з повідомленням strichka startup failedddddd, яке не показує справжню причину. шлях до сокета за замовчуванням той самий, що в main.go, і його можна перевизначити через STRICHKA_SOCKET

cd rust
nano database.url
cargo build --release
STRICHKA_DATABASE_FILE=database.url ./target/release/strichka &

має написати strichka ready. якщо стрічку не піднімати, сайт працює, але запити до стрічки віддадуть 503

крок 9, запуск. з папки backend, з експортованим env

cd ../backend
set -a
. ../.env
set +a
./mriya

у консолі буде рядок запуск :8080, порт в коді сталий, тож сайт буде на http://localhost:8080. сервер зупиняється через ctrl+c

про реєстрацію без пошти я вже написав. якщо смтп у вас немає, реєстрація чесно впаде в не вдалося надіслати лист, спробуй пізніше. варіанти три. або підставити в env свій справжній поштовий сервер на 465 порт, або закоментувати в бекенді частину з підтвердженням пошти й підтверджувати акаунти автоматично, або створити собі ак прямо в базі. третій шлях найшвидший для локального тесту, хеш згенерує той самий pgcrypto, і go-шний bcrypt його розуміє

psql "postgres://mriya:mriya@localhost:5432/mriya" -c "insert into public.useri (username, poshta, passw, iv) values ('israelfan', 'israaaelelld;akld;@mriya.ink', crypt('iloveisrael', gen_salt('bf', 10)), true)"

корисно знати. файли, які завантажують користувачі, лягають у dist/uploads, тому цю папку варто берегти між збірками фронту, інакше npm run build її перезапише. і ще одна річ, частина логіки живе не в main.go, а в тригерах бази, там ліміти учасників спільноти, лічильники коментарів, статистика відео і заборона міняти власника спільноти без підтвердження через current_setting mriya.transfer_community. тому форк без schema.sql поводитиметься не так, як це робить сайт прод чи як його назватиадплавпждылпдваплэыуплуыпуыкпыук
