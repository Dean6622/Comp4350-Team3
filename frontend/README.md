# SimpleFinance Frontend Next.js Project

## 📂 Folder Structure
```
/frontend
├── public                      # Static assets (images, favicons, etc.)
├── app                         # Next.js app (routing system)
│   ├── api                     # All API routers
│   ├── contexts                # All contexts folder
│   │   ├── AuthContext.tsx     # connect between api and UI
│   ├── auth                    # Authentication folders
│   │   ├── login               # login folder
│   │   │   ├── page.tsx 
│   │   ├── signup              # signup folder
│   │   │   ├── page.tsx 
│   ├── page.tsx                # Homepage
├── .env.local                  # Environment variables (ignored in version control)
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind css configure
├── package.json                # Project metadata and dependencies
├── eslint.config.mjs           # Eslint configure
└── README.md                   # Project documentation
```

## 🛠 Installation & Setup
### 1️⃣ Clone the repository
```sh
git@github.com:Dean6622/Comp4350-Team3.git
cd Comp4350-Team3
test test
```

### 2️⃣ Install dependencies
```sh
npm install  # or yarn install
```

## 📦 Building for Project
```sh
npm run build
npm run start
```

Visit `http://localhost:3000` in your browser.


## ✅ Code Quality
- **Linting:** `npm run lint`

## 📚 Useful Commands
| Command         | Description |
|-----------------|-------------|
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint`  | Run ESLint |


## 🛠 Tech Stack
- **Next.js** (React Framework)
- **Tailwind CSS / SCSS** (Styling, optional)
- **ESLint** (Code quality)

## 🙌 Contributing
1. Fork this repository
2. Create a new branch (`git checkout -b firstname-issuenumber-issuename`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to your branch (`git push origin feature-branch`)
5. Create a pull request


