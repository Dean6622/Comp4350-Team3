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
├── .next                      # Next.js build artifacts (auto-generated)
├── public                     # Static assets (images, favicons, etc.)
├── app                        # Next.js application root
│   ├── api                    # API routes for client-side requests
│   │   ├── auth.ts            # Authentication API methods
│   │   ├── transac.ts         # Transactions API methods
│   ├── auth                   # Authentication-related pages
│   │   ├── login              # Login page
│   │   │   ├── page.tsx       
│   │   ├── reset-password     # Password reset page
│   │   │   ├── page.tsx 
│   │   ├── signup              # signup folder
│   │   ├── signup             # Signup page
│   │   │   ├── page.tsx 
│   ├── page.tsx                # Homepage
├── .env.local                  # Environment variables (ignored in version control)
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind css configure
├── package.json                # Project metadata and dependencies
├── eslint.config.mjs           # Eslint configure
└── README.md                   # Project documentation
│   │   │   ├── layout.tsx
│   ├── contexts               # React Context API providers
│   │   ├── AuthContext.tsx    # Authentication state context
│   │   ├── TransactionsContext.tsx # Transactions state context
│   ├── dashboard              # Dashboard main page
│   │   ├── page.tsx 
│   ├── transactions           # Transactions page
│   │   ├── page.tsx
│   ├── favicon.ico            # Website favicon
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout for the app
│   ├── page.tsx               # Main entry page
├── components                 # Reusable UI components
│   ├── ui                     # UI-related components
│   │   ├── Button.tsx         # Button components
│   │   ├── Input.tsx          # Input components
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── Sidebar.tsx        # Sidebar menu
│   │   ├── TransactionFormModal.tsx # Transaction form modal
├── .env.local                 # Local environment variables (ignored by Git)
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── package.json               # Project metadata and dependencies
├── eslint.config.mjs          # ESLint configuration
└── README.md                  # Project documentation
```

## 🛠 Installation & Setup
### 1️⃣ Clone the repository
```sh
git@github.com:Dean6622/Comp4350-Team3.git
cd Comp4350-Team3
```

### 2️⃣ Install dependencies sonar test
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


