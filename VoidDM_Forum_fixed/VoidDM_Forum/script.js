const categories={news:'Новости проекта',general:'Общение',ideas:'Идеи и предложения',help:'Помощь игрокам',reports:'Жалобы и обращения',offtopic:'Свободная тема'};
const topicList=document.getElementById('topicList'),emptyState=document.getElementById('emptyState');
let activeFilter='all',registerMode=false,currentAccount=null;
const USERS_KEY='voidDM_demo_users_v2',SESSION_KEY='voidDM_demo_session_v2';
function readUsers(){try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return []}}
function saveUsers(users){localStorage.setItem(USERS_KEY,JSON.stringify(users))}
function filterTopics(cat){activeFilter=cat;let shown=0;document.querySelectorAll('.topic').forEach(t=>{const yes=cat==='all'||t.dataset.category===cat;t.hidden=!yes;if(yes)shown++});emptyState.hidden=shown!==0;document.getElementById('filterLabel').textContent=cat==='all'?'ВСЕ РАЗДЕЛЫ':categories[cat].toUpperCase();document.getElementById('topics').scrollIntoView({behavior:'smooth'});}
document.querySelectorAll('.category').forEach(btn=>btn.addEventListener('click',()=>filterTopics(btn.dataset.category)));
document.getElementById('showAll').addEventListener('click',()=>filterTopics('all'));
const overlay=document.getElementById('overlay'),topicOverlay=document.getElementById('topicOverlay'),adminOverlay=document.getElementById('adminOverlay');
function showAuth(){overlay.classList.add('show')}
function hideAuth(){overlay.classList.remove('show')}
document.getElementById('login').addEventListener('click',showAuth);
document.getElementById('close').addEventListener('click',hideAuth);
overlay.addEventListener('click',e=>{if(e.target===overlay)hideAuth()});
document.getElementById('switchMode').addEventListener('click',()=>{registerMode=!registerMode;document.getElementById('modalTitle').innerHTML=registerMode?'СОЗДАТЬ <em>АККАУНТ</em>':'ВОЙТИ НА <em>ФОРУМ</em>';document.getElementById('authSubmit').textContent=registerMode?'ЗАРЕГИСТРИРОВАТЬСЯ ↗':'ВОЙТИ ↗';document.getElementById('switchMode').textContent=registerMode?'Уже есть аккаунт? Войти':'Нет аккаунта? Зарегистрироваться'});
document.getElementById('authForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=document.getElementById('authName').value.trim(),password=document.querySelector('#authForm input[type=password]').value;
 if(name.length<3){alert('Никнейм должен содержать минимум 3 символа.');return}
 if(password.length<4){alert('Для демо-пароля нужно минимум 4 символа.');return}
 let users=readUsers();
 if(registerMode){
   if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())){alert('Такой ник уже зарегистрирован. Попробуй другой или войди.');return}
   const isFirst=users.length===0;
   users.push({name,password,role:isFirst?'admin':'user'});
   saveUsers(users);
   alert(isFirst?'Аккаунт создан! Это первый аккаунт в этом браузере, поэтому ему выдана роль администратора демо-форума.':'Регистрация успешна! Теперь войди в аккаунт.');
   registerMode=false;
   document.getElementById('modalTitle').innerHTML='ВОЙТИ НА <em>ФОРУМ</em>';
   document.getElementById('authSubmit').textContent='ВОЙТИ ↗';
   document.getElementById('switchMode').textContent='Нет аккаунта? Зарегистрироваться';
   document.getElementById('authName').value=name;
   document.querySelector('#authForm input[type=password]').value='';
   return;
 }
 const user=users.find(u=>u.name.toLowerCase()===name.toLowerCase()&&u.password===password);
 if(!user){alert('Не удалось войти. Проверь ник и пароль или сначала зарегистрируйся.');return}
 currentAccount={name:user.name,role:user.role};localStorage.setItem(SESSION_KEY,JSON.stringify(currentAccount));hideAuth();updateAccountUI();alert('Добро пожаловать, '+user.name+'!');
});
function updateAccountUI(){
 const saved=localStorage.getItem(SESSION_KEY);
 if(!currentAccount&&saved){try{currentAccount=JSON.parse(saved)}catch{}}
 const logged=!!currentAccount;
 document.getElementById('currentUser').hidden=!logged;
 document.getElementById('currentUser').textContent=logged?(currentAccount.name+(currentAccount.role==='admin'?' · ADMIN':'')):'';
 document.getElementById('login').hidden=logged;
 document.getElementById('logout').hidden=!logged;
 document.getElementById('adminPanel').hidden=!(logged&&currentAccount.role==='admin');
}
document.getElementById('logout').addEventListener('click',()=>{currentAccount=null;localStorage.removeItem(SESSION_KEY);updateAccountUI()});
function openTopic(){if(!currentAccount){alert('Сначала войди или зарегистрируйся, чтобы создавать темы.');showAuth();return}topicOverlay.classList.add('show')}
function closeTopic(){topicOverlay.classList.remove('show')}
document.getElementById('createTopic').addEventListener('click',openTopic);
document.getElementById('createTop').addEventListener('click',openTopic);
document.getElementById('closeTopic').addEventListener('click',closeTopic);
topicOverlay.addEventListener('click',e=>{if(e.target===topicOverlay)closeTopic()});
document.getElementById('topicForm').addEventListener('submit',e=>{
 e.preventDefault();
 const title=document.getElementById('topicTitle').value.trim(),cat=document.getElementById('topicCategory').value,body=document.getElementById('topicText').value.trim();
 if(!title||!body)return;
 const article=document.createElement('article');article.className='topic';article.dataset.category=cat;article.dataset.author=currentAccount.name;
 const avatar=document.createElement('div');avatar.className='topic-avatar';avatar.textContent=currentAccount.name.slice(0,1).toUpperCase();
 const main=document.createElement('div');main.className='topic-main';
 const b=document.createElement('b');b.textContent=title;
 const p=document.createElement('p');p.textContent=body;
 const small=document.createElement('small');small.textContent=categories[cat]+' · '+currentAccount.name+' · только что';
 main.append(b,p,small);const meta=document.createElement('div');meta.className='topic-meta';meta.innerHTML='<b>0</b><small>ответов</small>';
 article.append(avatar,main,meta);topicList.prepend(article);document.getElementById('topicForm').reset();closeTopic();filterTopics(cat);renderAdminTopics();
});
function openAdmin(){if(!currentAccount||currentAccount.role!=='admin'){alert('Доступ только администраторам.');return}renderAdminTopics();adminOverlay.classList.add('show')}
function renderAdminTopics(){const list=document.getElementById('adminTopicList');list.innerHTML='';document.querySelectorAll('.topic').forEach((t,i)=>{const row=document.createElement('div');row.className='admin-topic-row';const title=document.createElement('span');title.textContent=t.querySelector('.topic-main b')?.textContent||'Тема';const del=document.createElement('button');del.textContent='УДАЛИТЬ';del.addEventListener('click',()=>{if(confirm('Удалить тему "'+title.textContent+'"?')){t.remove();renderAdminTopics();filterTopics(activeFilter)}});row.append(title,del);list.append(row)});if(!list.children.length)list.textContent='Тем пока нет.'}
document.getElementById('adminPanel').addEventListener('click',openAdmin);
document.getElementById('closeAdmin').addEventListener('click',()=>adminOverlay.classList.remove('show'));
adminOverlay.addEventListener('click',e=>{if(e.target===adminOverlay)adminOverlay.classList.remove('show')});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('nav a').forEach(n=>n.classList.remove('selected'));a.classList.add('selected')}));
updateAccountUI();
