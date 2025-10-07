# Final Project
Team 1: Amanda Longo, Grace Mahoney, Nia Junod

## General description
<!--1. A brief description of what you created, and a link to the project itself (two paragraphs of text)-->

Your project should consist of a complete Web application, exhibiting facets of the three main sections of the course material:

- Static web page content and design. You should have a project that is accessible, easily navigable, and features significant content.
- Dynamic behavior implemented with JavaScript (TypeScript is also allowed if your group wants to explore it).
- Server-side programming *using Node.js*. Typically this will take the form of some sort of persistent data (database), authentication, and possibly server-side computation. 
- A video (less than five minutes) where each group member explains some aspect of the project. An easy way to produce this video is for you all the groups members to join a Zoom call that is recorded; each member can share their screen when they discuss the project or one member can "drive" the interface while other members narrate (this second option will probably work better.) Upload the video to Canvas. (Further instructions are available in the Canvas assignment.) Make sure your video is less than five minutes but long enough to successfully explain your project and show it in action. There is no minimum video length.

## Instructions

**for groupmates:**
you NEED to run both front and backend

to run locally 
1. cd apps
2. npm install
3. npm run dev

if you have any questions/errors, pls ask amanda!! thank youuu
you need to create your own .env file too in order to run it locally 
1. create new file in backend called .env (it will automatically be put into git ignore so it wont be pushed)
2. paste this info in
>Begining
`# MongoDB Atlas credentials`
DB_USER=gymahoney_db_user
DB_PASS=gymahoney
MONGO_HOST=cluster0.1famzi9.mongodb.net
MONGO_DB=photoBucket

`# Express session secret (used to sign cookies)`
SESSION_SECRET=hFj39s82nF!9@jsdf83msd9sn!
NODE_ENV=development # Change to production in deployment

`# Cloudinary credentials`
CLOUDINARY_CLOUD_NAME=dya8p6qmw
CLOUDINARY_API_KEY=744213562827951
CLOUDINARY_API_SECRET=EhDduo_i1FYS1x82R57xNbTOjjM
>End

then you can connect properly to graces db 
## Technologies
<!--3. An outline of the technologies you used and how you used them.-->

## Challenges
<!--4. What challenges you faced in completing the project.-->

## Contributions
<!--5. What each group member was responsible for designing / developing.-->

## Accessibility Features
<!--6. What accessibility features you included in your project.-->

Think of 1, 3, and 4 in particular in a similar vein to the design / technical achievements for A1—A4. Make a case for why what you did was challenging and why your implementation deserves a grade of 100%.

## References
https://www.geeksforgeeks.org/node-js/how-to-store-images-in-mongodb-using-nodejs/ (image upload to mongodb)
