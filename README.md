
# Key Features

#  Tech Stack

| Layer | Technologies |

| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens) |
| **Database** | MongoDB with Mongoose ODM |
| **Validation** | Zod (Schema Validation), React Hook Form |



# Project Structure

mslr-monorepo/
├── apps/
│   ├── web-frontend/   
│       ├── src/
│       │   ├── app/
│       │   │   ├── dashboard/       
│       │   │   ├── forgot-password/
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── Root layout page
│       │   │   └── Landing page
│       │   ├── components/
│       │   │   ├── footer/
│       │   │   ├── ui/
│       │   │   ├── Common Dashboard layout
│       │   │   └── Common Referndum form
│   └── web-backend/        
│       ├── src/
│       │   ├── middleware/
│       │   │   ├── authmiddleware.ts   
│       │   ├── models/         
│       │   │   ├── preAuthorizedScc.ts  
│       │   │   ├── referendum.ts  
│       │   │   └── voter.ts     
│       │   ├── routes/ 
│       │   │   ├── auth.ts  
│       │   │   ├── referendum.ts 
│       │   │   └── vote.ts 
│       │   ├── seed.ts 
│       │   └── index.ts        # Main entry point
├── packages/
│   └── shared-types/       # Still shared with frontend
└── package.json            # Root configuration


# Running the Project from a Zip File
Follow these steps to get the MSLR system running on your local machine:

1. Extraction
Right-click the provided .zip file and select Extract All... or use your preferred extraction tool.

Open the extracted folder mslr-monorepo in your code editor.

2. Backend (Server) Setup
Open a terminal and navigate to the server folder: cd apps/web-backend

Install the required packages: npm install

Create a .env.example file: Include the keys but leave the values blank or use placeholders. Input your db credentials.

  you can input your mongo url by:

  Step 1: Login into your mongo atlas
  Step 2: Create a cluster of free version -> Click on Create Deployment.
  Step 3: Connect to a cluster where you'll have username and password and then click on to create a db user ->  click on "choose a coonection method" -> click on drivers -> copy the url and paste in .env file as the value of MONGO_URI. -> click on done.
  Step 4: Click on Browse collection. You'll see the data in db after running the seed command.

Start the backend server: npm run dev -> for connecting to mongodb

In the new terminal with same file path/existing terminal after terminating the above command -

Run the command: npm run seed

After running the above command again run : npm run dev

The server should now be running at http://localhost:3001

3. Frontend (Client) Setup
Open a second terminal window.

Navigate to the frontend folder: cd apps/web-frontend

Install the dependencies: npm install

Start the Next.js development server: npm run dev

The application will be accessible at http://localhost:3000

If there's any issue, or the app is not running, try running npm install again and then npm run dev.
