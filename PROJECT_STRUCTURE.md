# EF Enroll Project Structure

Ky dokument shpjegon strukturen aktuale te projektit, pse ekziston secili folder/file kryesor, dhe si lidhen pjeset mes vete. Qellimi eshte qe projekti te jete me i organizuar, me i lehte per mirembajtje, dhe me i gatshem per autentifikim, role dhe admin approval.

## Project Purpose

EF Enroll eshte platforme per menaxhimin e regjistrimit te studenteve ne kurse.

Aktualisht projekti ka CRUD per:

- Courses
- Students
- Professors
- Semesters
- Departments
- Schedules

Me vone projekti planifikohet te zgjerohet me:

- register si student/professor
- admin approval per professor/user
- role assignment
- JWT login
- role-based layouts
- professor sheh vetem kurset e veta
- enroll students ne kurse

## Backend Structure

Backend ndodhet ne folderin `backend`.

### `backend/server.js`

Ky eshte file kryesor i backend-it.

Brenda tij:

- krijohet Express app
- aktivizohet `cors`
- aktivizohet `express.json()` per me lexu JSON body prej frontend-it
- lidhen routes permes `app.use(routes)`
- startohet serveri ne portin `5000`

Pse u pastrua:

Me heret `server.js` importonte secilen route vec e vec. Tani importon vetem:

```js
const routes = require("./routes");
```

Kjo e ben `server.js` me te paster. Detajet e routes jane zhvendosur ne `backend/routes/index.js`.

### `backend/routes/index.js`

Ky file i mbledh krejt backend routes ne nje vend.

Brenda tij:

```js
router.use("/courses", coursesRoutes);
router.use("/departments", departmentsRoutes);
router.use("/professors", professorsRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/semesters", semestersRoutes);
router.use("/students", studentsRoutes);
router.use("/users", usersRoutes);
```

Logjika:

Kur frontend ben request te `/professors`, Express hyn ne `routes/index.js`, e gjen:

```js
router.use("/professors", professorsRoutes);
```

pastaj request-i shkon te `backend/routes/professors.js`.

### `backend/routes/professors.js`

Ky file merret me CRUD per professors.

Brenda ka:

- `GET /` per me i marre krejt profesoret
- `GET /:id` per nje profesor te caktuar
- `POST /` per me kriju user + professor
- `PUT /:id` per me update user + professor
- `DELETE /:id` per me fshi professor + user

Aktualisht admini mund ta shtoje profesorin me password, por kjo eshte logjike e perkohshme CRUD. Me vone workflow duhet te ndryshoje:

```text
professor registers -> status pending -> admin approves -> professor can login
```

Pra profesori duhet te regjistrohet vete, jo admini me ia kriju password-in.

### `backend/routes/departments.js`

Ky file menaxhon departments.

Perdoret edhe nga faqja e profesoreve ne frontend, sepse forma e professor ka dropdown per department.

Shembull lidhjeje:

```text
Professors.jsx -> departmentService.getAll() -> GET /departments -> departments.js
```

## Frontend Structure

Frontend ndodhet ne folderin `frontend/src`.

Struktura kryesore:

```text
src/
  api/
  components/
  layouts/
  pages/
  routes/
  services/
  App.jsx
  main.jsx
```

## Frontend Entry Files

### `frontend/src/main.jsx`

Ky eshte hyrja e React app.

Brenda tij:

- importohet React
- importohet ReactDOM
- importohet `App`
- React e renderon `App` brenda elementit me id `root`

Pra ky file vetem e starton aplikacionin.

### `frontend/src/App.jsx`

Ky file tash eshte shume i thjeshte.

Brenda tij:

```jsx
<Router>
  <AppRoutes />
</Router>
```

Logjika:

- `Router` aktivizon React Router
- `AppRoutes` mban definicionin e krejt routes

Pse nuk jane krejt routes ne `App.jsx`:

Sepse `App.jsx` duhet te jete entry i paster i aplikacionit. Detajet e routes jane ne `routes/AppRoutes.jsx`.

## Routes

### `frontend/src/routes/AppRoutes.jsx`

Ky file definon faqet e frontend-it.

Route kryesore publike:

```jsx
<Route path="/" element={<PublicCourses />} />
```

Kjo eshte faqja qe hapet ne `localhost:5173`. Studentet i shohin kurset publike aty dhe nese klikojne `Enroll` pa login, dergohen te `/login`.

Brenda tij ka routes si:

```jsx
<Route path="professors" element={<Professors />} />
<Route path="courses" element={<Courses />} />
<Route path="students" element={<Students />} />
```

Keto routes jane brenda:

```jsx
<Route path="/" element={<AppLayout />}>
```

Kjo do te thote qe krejt keto faqe perdorin layout-in e perbashket `AppLayout`.

Pra dallimi eshte:

- `/` eshte public course catalog per studentet
- `/courses` eshte management/CRUD page per kurset

### `frontend/src/routes/navigation.js`

Ky file mban listen e linkave te navbar-it.

Shembull:

```js
{ to: "/courses", label: "Courses" }
```

Pse ekziston:

Qe linkat e navigimit te mos jene te shkruar direkt brenda `MainNavbar.jsx`. Nese shtohet nje faqe e re, mund ta shtojme ne kete liste.

## Layouts

Layouts jane ne `frontend/src/layouts`.

Layout eshte struktura e perbashket e faqes, p.sh. header, navbar dhe vendi ku shfaqet faqja aktuale.

### `frontend/src/layouts/AppLayout.jsx`

Ky eshte layout kryesor i aplikacionit.

Brenda tij ka:

- background kryesor
- header
- titullin "EF Enroll"
- `MainNavbar`
- `<Outlet />`

Pjesa me e rendesishme:

```jsx
<Outlet />
```

`Outlet` eshte vendi ku React Router e shfaq faqen aktive.

Shembull:

- nese URL eshte `/professors`, ne `Outlet` shfaqet `Professors.jsx`
- nese URL eshte `/courses`, ne `Outlet` shfaqet `Courses.jsx`

Pse ekziston:

Qe header dhe navbar mos te kopjohen ne cdo faqe.

### `frontend/src/layouts/admin/AdminLayout.jsx`

Aktualisht ky layout e kthen `AppLayout`.

```jsx
const AdminLayout = () => {
  return <AppLayout />;
};
```

Pse ekziston edhe pse tash duket i thjeshte:

Eshte pergatitje per role-based layout. Me vone admini mund te kete navbar/sidebar tjeter nga profesori ose studenti.

Shembull me vone:

- admin sheh Users, Approvals, Roles
- professor sheh My Courses, Materials, Grades
- user/student sheh Courses, Enrollments

### `frontend/src/layouts/professor/ProfessorLayout.jsx`

Aktualisht edhe ky e kthen `AppLayout`.

Qellimi:

Me vone, kur te kemi JWT dhe role, nese tokeni ka role `professor`, aplikacioni mund ta renderoje `ProfessorLayout`.

Ky layout mund te permbaje navigim vetem per profesorin.

### `frontend/src/layouts/user/UserLayout.jsx`

Aktualisht e kthen `AppLayout`.

Qellimi:

Me vone perdoret per student/user. Studentit nuk duhet t'i shfaqen te gjitha admin pages.

Pra keto tre role layouts jane strukture e pergatitur per fazen e autentifikimit.

## Navigation Component

### `frontend/src/components/navigation/MainNavbar.jsx`

Ky komponent e shfaq navbar-in.

Brenda tij:

- importohet `NavLink` nga `react-router-dom`
- importohet `navItems`
- behet `.map()` mbi `navItems`
- per secilin item krijohet nje link

Pse perdoret `NavLink`:

`NavLink` e di kur linku eshte aktiv. Prandaj nese jemi ne `/professors`, linku "Professors" merr stil aktiv.

## UI Components

UI components jane ne `frontend/src/components/ui`.

Qellimi:

Mos me shkru te njejtat `className` per butona/inputa ne cdo faqe.

### `Button.jsx`

Ky komponent perdoret per krejt butonat.

Brenda tij ka `variantClasses`:

- `primary`
- `secondary`
- `danger`
- `ghost`

Shembull:

```jsx
<Button variant="danger">Delete</Button>
```

Logjika:

- nese nuk jepet variant, perdoret `primary`
- nese `fullWidth` eshte true, butoni merr `w-full`
- krejt props tjera kalohen te elementi real `<button>`

Pse eshte i dobishem:

Nese profesori kerkon me ndryshu dizajnin e butonave, ndryshohet vetem `Button.jsx`, jo secila faqe.

### `TextInput.jsx`

Ky komponent mbeshtjell `<input>`.

Perdoret per:

- text
- email
- number
- date
- time

Logjika:

```jsx
<TextInput name="email" value={formData.email} onChange={handleChange} />
```

`TextInput` i merr props dhe i kalon te `<input>` me `{...props}`.

Pse:

Te gjithe input-at kane stil te njejte dhe nuk perseritet className.

### `TextArea.jsx`

Ky komponent mbeshtjell `<textarea>`.

Perdoret kur fusha ka tekst me te gjate, p.sh. description.

### `SelectInput.jsx`

Ky komponent mbeshtjell `<select>`.

Perdoret per dropdown, p.sh. select department, select professor, select semester.

Shembull:

```jsx
<SelectInput name="departamenti" value={formData.departamenti}>
  <option value="">Select Department</option>
</SelectInput>
```

## Layout Components

Keto jane ne `frontend/src/components/layout`.

### `PageContainer.jsx`

Ky komponent e mban strukturen e perbashket te nje faqeje CRUD.

Brenda tij:

- background
- padding
- max width
- title
- children

Shembull:

```jsx
<PageContainer title="Professors Management">
  ...
</PageContainer>
```

Pse:

Faqet si Professors, Students, Departments kane te njejten strukture baze.

### `FormCard.jsx`

Ky komponent e mban formen brenda nje card.

Merr:

- `title`
- `children`

Shembull:

```jsx
<FormCard title="Add Professor">
  form inputs
</FormCard>
```

### `TableCard.jsx`

Ky komponent e mban tabelen brenda nje card.

Merr:

- `title`
- `children`

Pse:

Tabela ne secilen faqe ka strukture te ngjashme, prandaj nuk e perserisim card wrapper.

## API Layer

### `frontend/src/api/httpClient.js`

Ky file eshte axios client qendror.

Brenda tij:

```js
const httpClient = axios.create({
  baseURL: "http://localhost:5000",
});
```

Logjika:

Ne services shkruhet vetem `/professors`, por axios e kthen ne:

```text
http://localhost:5000/professors
```

### Request Interceptor

```js
httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
```

Qellimi:

Me vone, kur te shtohet JWT login, tokeni do te ruhet ne `localStorage`. Ky interceptor e shton tokenin automatikisht ne cdo request.

Pra nuk kemi nevoje me shkru ne cdo faqe:

```js
headers: { Authorization: `Bearer ${token}` }
```

### Response Interceptor

```js
if (error.response?.status === 401) {
  localStorage.removeItem("token");
}
```

Qellimi:

Nese backend kthen `401 Unauthorized`, tokeni fshihet sepse mund te jete invalid ose expired.

Me vone ketu mund te shtohet redirect te login page.

## Authentication And JWT

Autentifikimi u nda ne backend dhe frontend.

### Backend Auth Files

#### `backend/config/auth.js`

Ky file mban konfigurimin e JWT.

Brenda tij:

```js
const JWT_SECRET = process.env.JWT_SECRET || "ef_enroll_secret_key";
const JWT_EXPIRES_IN = "1d";
```

Logjika:

- `JWT_SECRET` perdoret per me nenshkru dhe verifiku tokenin
- `JWT_EXPIRES_IN` tregon sa kohe vlen tokeni
- me vone `JWT_SECRET` duhet te ruhet ne `.env`, jo direkt ne kod

#### `backend/middleware/authMiddleware.js`

Ky file ka middleware per mbrojtje te routes.

`authenticateToken`:

- lexon header `Authorization`
- e merr tokenin pas fjales `Bearer`
- e verifikon me `jwt.verify`
- nese tokeni eshte valid, e vendos userin ne `req.user`

`requireRole`:

- perdoret me vone kur nje route duhet te lejohet vetem per role te caktuara
- p.sh. vetem admini mund te aprovoje users

#### `backend/routes/auth.js`

Ky file ka auth routes:

- `POST /auth/login`
- `POST /auth/register/student`
- `POST /auth/register/professor`
- `GET /auth/me`

`/auth/login`:

- merr email dhe password
- gjen userin ne databaze
- krahason passwordin me `bcrypt.compareSync`
- kontrollon nese statusi eshte `approved`
- krijon JWT token
- kthen token dhe user data ne frontend

`/auth/register/student`:

- krijon user me role `student`
- statusi i studentit aktualisht eshte `approved`
- krijon edhe rresht ne tabelen `students`

`/auth/register/professor`:

- krijon user me role `professor`
- statusi eshte `pending`
- krijon edhe rresht ne tabelen `professors`
- profesori nuk mund te beje login derisa admini ta aprovoje

#### `backend/routes/admin.js`

Ky file ka routes qe perdoren vetem nga admini.

Ne fillim te file-it routes mbrohen me:

```js
router.use(authenticateToken);
router.use(requireRole("admin"));
```

Kjo do te thote:

- request-i duhet te kete JWT token valid
- user-i ne token duhet te kete `role = admin`

Endpoints:

- `GET /admin/pending-professors` merr professor accounts me status `pending`
- `PUT /admin/users/:id/approve` e ndryshon statusin ne `approved`
- `PUT /admin/users/:id/reject` e ndryshon statusin ne `rejected`

Flow:

```text
Professor signs up
Backend creates user role professor, status pending
Admin logs in
Admin opens /admin/approvals
Admin clicks Approve
Backend changes status to approved
Professor can log in
```

#### `backend/migrations/001_add_auth_fields.sql`

Ky file duhet ekzekutuar ne MySQL.

Ai shton ne tabelen `users`:

- `role`: admin/professor/student
- `status`: pending/approved/rejected

Keto fusha duhen per login, register dhe admin approval.

### Frontend Auth Files

#### `frontend/src/services/authService.js`

Ky service i mban auth API calls.

Brenda tij:

```js
login(credentials)
registerStudent(studentData)
registerProfessor(professorData)
me()
```

Faqet nuk therrasin axios direkt. Ato therrasin `authService`.

#### `frontend/src/services/adminService.js`

Ky service perdoret per admin approval.

Funksionet:

```js
getPendingProfessors()
approveProfessor(userId)
rejectProfessor(userId)
```

Keto funksione therrasin:

```text
/admin/pending-professors
/admin/users/:id/approve
/admin/users/:id/reject
```

#### `frontend/src/utils/authStorage.js`

Ky file merret me ruajtjen e login state ne `localStorage`.

Funksionet:

- `saveAuth(token, user)` ruan tokenin dhe userin
- `getAuthUser()` lexon userin
- `clearAuth()` fshin tokenin dhe userin

#### `frontend/src/pages/auth/Login.jsx`

Ky eshte login i perbashket per admin, professor dhe student.

Pse nuk ka login te ndare:

Sepse autentifikimi eshte i njejte per krejt: email + password. Roli merret nga backend prej databazes/tokenit.

Flow:

```text
user shkruan email/password
Login.jsx thirr authService.login()
backend kthen token + user
saveAuth ruan tokenin
frontend ben redirect sipas role
```

Nese role eshte `admin`, frontend e dergon user-in te:

```text
/admin/approvals
```

#### `frontend/src/pages/auth/Register.jsx`

Ky eshte ekran zgjedhes per register.

Ka dy opsione:

- Register as Student
- Register as Professor

Pse register eshte i ndare:

Sepse studenti dhe profesori kane te dhena te ndryshme gjate regjistrimit.

#### `frontend/src/pages/auth/RegisterStudent.jsx`

Ky file ka formen e studentit.

Dergohet ne:

```text
POST /auth/register/student
```

Krijon user + student profile.

#### `frontend/src/pages/auth/RegisterProfessor.jsx`

Ky file ka formen e profesorit.

Dergohet ne:

```text
POST /auth/register/professor
```

Krijon user + professor profile me status `pending`.

Profesori nuk shtohet me password nga admini. Ai regjistrohet vete, pastaj admini e aprovon.

#### `frontend/src/pages/admin/AdminApprovals.jsx`

Kjo faqe perdoret nga admini per me aprovu ose refuzu professor accounts.

Brenda saj:

- merret lista e professor accounts me status `pending`
- shfaqet tabela me emrin, email, titullin, departamentin dhe statusin
- admini mund te klikoje `Approve`
- admini mund te klikoje `Reject`

Kur klikohet `Approve`:

```text
AdminApprovals.jsx -> adminService.approveProfessor(userId)
adminService -> PUT /admin/users/:id/approve
backend -> UPDATE users SET status = 'approved'
```

Pas aprovimit, profesori mund te beje login.

## Services

Services jane ne `frontend/src/services`.

Qellimi:

Faqet te mos therrasin axios direkt. Faqet duhet te merren me UI, form state dhe table rendering. Services merren me API communication.

### `professorService.js`

Ky file ka CRUD calls per professors.

Brenda tij:

```js
getAll: () => httpClient.get("/professors")
create: (professorData) => httpClient.post("/professors", professorData)
update: (professorId, professorData) =>
  httpClient.put(`/professors/${professorId}`, professorData)
remove: (professorId) => httpClient.delete(`/professors/${professorId}`)
```

Logjika:

- `getAll` merr krejt profesoret
- `create` krijon profesor
- `update` perditeson profesor
- `remove` fshin profesor

### `departmentService.js`

Ky file ka CRUD calls per departments.

Perdoret ne:

- `Departments.jsx`
- `Professors.jsx`, sepse forma e profesorit ka dropdown per departments

### `courseService.js`

Ky file ka CRUD calls per courses.

Perdoret ne:

- `Courses.jsx`
- `Schedules.jsx`, sepse schedule duhet te zgjedhe nje course

### `studentService.js`

Ky file ka CRUD calls per students.

Perdoret ne `Students.jsx`.

### `semesterService.js`

Ky file ka CRUD calls per semesters.

Perdoret ne:

- `Semesters.jsx`
- `Courses.jsx`, sepse course lidhet me semester

### `scheduleService.js`

Ky file ka CRUD calls per schedules.

Perdoret ne `Schedules.jsx`.

## Pages

Pages jane ne `frontend/src/pages`.

Faqet permbajne:

- state me `useState`
- load te te dhenave me `useEffect`
- handlers per add/update/delete
- render te formave dhe tabelave

Faqet nuk duhet te mbajne:

- axios configuration
- baseURL
- token headers
- stile te perseritura per input/button

Keto jane zhvendosur ne `api`, `services` dhe `components`.

## Example Flow: Add Professor

Ky eshte flow i plote kur klikohet `Add Professor`.

### 1. User ploteson formen

Ne `Professors.jsx`, input-at e formes jane te lidhur me `formData`.

Shembull:

```jsx
<TextInput
  name="username"
  value={formData.username}
  onChange={handleChange}
/>
```

Kur user shkruan, thirret `handleChange`.

### 2. `handleChange` perditeson state

```js
setFormData({
  ...formData,
  [e.target.name]: e.target.value,
});
```

Logjika:

- `e.target.name` tregon cila fushe ndryshoi
- `e.target.value` eshte vlera e re
- `formData` perditesohet pa i humbur fushat tjera

### 3. Klikohet `Add Professor`

Butoni ne `Professors.jsx`:

```jsx
<Button onClick={addProfessor} fullWidth>
  Add Professor
</Button>
```

Ky thirr funksionin `addProfessor`.

### 4. `addProfessor` thirr service

```js
professorService.create(formData)
```

Faqja nuk e di URL-ne. Ajo vetem e thirr funksionin e service.

### 5. `professorService` thirr backend

Ne `professorService.js`:

```js
create: (professorData) => httpClient.post("/professors", professorData)
```

Kjo e dergon POST request ne `/professors`.

### 6. `httpClient` shton baseURL

`httpClient` e kthen `/professors` ne:

```text
http://localhost:5000/professors
```

Nese ka token ne `localStorage`, e shton edhe `Authorization` header.

### 7. Backend e pranon request-in

Ne `server.js`:

```js
app.use(routes);
```

Ne `routes/index.js`:

```js
router.use("/professors", professorsRoutes);
```

Pastaj request-i shkon ne `backend/routes/professors.js`.

### 8. `professors.js` ben insert ne database

Aktualisht backend krijon:

- nje user ne tabelen `users`
- nje professor ne tabelen `professors`

### 9. Frontend rifreskon listen

Pas suksesit:

```js
fetchProfessors();
resetForm();
```

Logjika:

- `fetchProfessors()` merr listen e re prej backend
- `resetForm()` e pastron formen

## Current Implemented Refactor

Deri tash eshte bere:

- backend routes jane organizuar me `routes/index.js`
- frontend routes jane ndare ne `routes/AppRoutes.jsx`
- navigation links jane ndare ne `routes/navigation.js`
- layout kryesor eshte ndare ne `layouts/AppLayout.jsx`
- jane pergatitur role layouts per admin/professor/user
- UI components jane ndare ne `components/ui`
- layout components jane ndare ne `components/layout`
- API client eshte centralizuar ne `api/httpClient.js`
- API calls jane zhvendosur ne `services`
- pages nuk therrasin me axios direkt

## Important Note About Current Professor CRUD

Aktualisht `Professors.jsx` ende ka forme per me shtu profesor me password.

Kjo eshte pjese e CRUD-it ekzistues, por sipas kerkeses se profesorit duhet ndryshuar me vone.

Workflow i ardhshem duhet te jete:

```text
Professor registers himself/herself
Account status = pending
Admin approves account
Role = professor
Professor can login
```

Pra admini nuk duhet te krijoje password per profesorin.

## Planned Next Features

Hapat e ardhshem te projektit:

1. Register ndahet ne student/professor
2. User/professor status: pending/approved/rejected
3. Admin approval screen
4. Role field ne users
5. JWT login
6. Protected routes
7. Render layout sipas role
8. Professor sheh vetem kurset e veta
9. Student enroll ne course
10. ORM ose TypeORM/Sequelize per MySQL

## Short Defense Summary

Nje fjali qe mund te perdoret ne mbrojtje:

```text
Kam bere refactor te struktures se projektit duke ndare backend routes, frontend routes, layouts, reusable UI components, axios client dhe services, ne menyre qe projekti te jete me i mirembajtshem dhe i gatshem per autentifikim, role dhe admin approval.
```
