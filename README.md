# PhotoBucket: Every Bucket Deserves a Photo Finish
Team 1: Amanda Longo, Grace Mahoney, Nia Junod

Link to PhotoBucket App: 

## General description
**PhotoBucket** is a collaborative bucket list web application that allows users to create, manage and share their life goals with their friends or family. Users can sign up and organize their goals within 4 custom bucket lists. Each bucket list contains individual items with descriptions, locations, priority levels and completion status, similar to a regular to do list. Our collaboration feature allows users to invite up to 4 people to their bucket list to work towards the same goals and create memories together. The collaboration aspect uses real time editing so that users can work at the same time to add and edit their goals. 

What makes photobucket unique, is that our functionality centers around the visual completion system, where a user must upload or take a photo memory as evidence when marking a bucket list item as complete. These completed bucket list items are associated with those images and then moved to the **Bucket Gallery** so that you can revisit those bucket lists items you completed and have visual memories all in one place! The gallery is both a digital scrapbook, and a progress tracker which adds a more memorable experience. Built with TypeScript, React, Node.js, Express, and MongoDB, the application features secure authentication, responsive design with TailwindCSS, AceternityUI, cloud-based image storage through Cloudinary, and robust session management. Users can seamlessly navigate between different bucket lists, manage collaborators, customize bucket titles, and maintain persistent data across sessions, making PhotoBucket a comprehensive platform for turning dreams into documented realities.

## Instructions / User Manual 
### Hero Page
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 00 31 PM" src="https://github.com/user-attachments/assets/6bccc08e-73ee-4c03-aaf6-d790d4805305" />
description here

### Login and Signup 
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 00 47 PM" src="https://github.com/user-attachments/assets/3984b707-4684-4be1-9d32-2703255492e5" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 00 52 PM" src="https://github.com/user-attachments/assets/e9959e2d-09a3-4dfb-b555-95fe4257d48d" />

description here 

### Dashboard/Main Page
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 01 39 PM" src="https://github.com/user-attachments/assets/19a5f847-007f-41a5-bf6d-d4531481d074" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 01 42 PM" src="https://github.com/user-attachments/assets/92c302ca-1e02-4604-8002-e1c0bed47262" />
description here 

### Adding and Completing Items 
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 02 31 PM" src="https://github.com/user-attachments/assets/62b375e4-7bfa-425f-a66c-c6fc05cb72bf" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 02 38 PM" src="https://github.com/user-attachments/assets/a4c272a4-b4d9-4fa3-b1c8-8e863937eaa6" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 05 49 PM" src="https://github.com/user-attachments/assets/303ec4b8-50d0-4c8d-a1bb-176156232fe3" />

description here 

### Bucket Gallery 
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 41 57 PM" src="https://github.com/user-attachments/assets/c92b670f-8e72-4965-87c0-16c975c57cc1" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 42 05 PM" src="https://github.com/user-attachments/assets/5f40c1ba-8cd6-4b86-8198-85db6d94d560" />

description here

### Collaboration 
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 02 24 PM" src="https://github.com/user-attachments/assets/d329075f-9547-40bd-b6de-158f159e91ab" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 11 33 PM" src="https://github.com/user-attachments/assets/35fc171e-0580-4c0f-9932-86580394814b" />
<img width="1512" height="829" alt="Screenshot 2025-10-09 at 1 11 44 PM" src="https://github.com/user-attachments/assets/53d0b074-26bd-4bd6-9f17-7cb123b779f3" />

description here

## Technologies
### Frontend Technologies
- **React**: Core UI framework for building component-based user interfaces and managing state across bucket lists and collaboration features
- **TypeScript**: Provided type safety and enhanced development experience with strict typing for props, API responses, and data models
- **Vite**: Fast development server and build tool for optimized bundling and hot module replacement during development
- **React Router DOM**: Client-side routing for navigation between pages (Home, Bucket Lists, Join Bucket, Gallery)
- **TailwindCSS**: Utility-first CSS framework for responsive design and consistent styling across components

### Backend Technologies
- **Node.js & Express**: Server framework handling API routes, middleware, and HTTP request/response cycle
- **TypeScript**: Backend type safety for API endpoints, database models, and service functions
- **MongoDB & Mongoose**: NoSQL database for storing user accounts, bucket lists, items, and collaboration data with ODM for schema validation
- **Express Session**: Session management for user authentication and maintaining login state across requests
- **bcrypt**: Password hashing and authentication security for user account protection
- **CORS**: Cross-origin resource sharing configuration for frontend-backend communication

### Cloud & Storage Technologies
- **Cloudinary**: Cloud-based image storage and optimization for bucket list completion photos
- **Multer & multer-storage-cloudinary**: File upload middleware for handling image uploads from completion modal
- **MongoDB Atlas**: Cloud database hosting for production data persistence

### Authentication & Security
- **Express Sessions**: Server-side session management with MongoDB session store
- **bcrypt**: Secure password hashing using salt rounds for user authentication
- **CORS Configuration**: Secure cross-origin requests between frontend and backend
- **Environment Variables**: Secure configuration management for API keys and database credentials

### UI/UX Libraries & Components
- **AceternityUI Components**: Pre-built animated components for enhanced user experience (sidebar, buttons, modals)
- **React Icons**: Additional icon library for UI elements and actions
- **Custom Components**: Reusable components (BucketCard, Avatar, Modal components) built with TypeScript interfaces

## Challenges
- **Bugs**:
- **Implementation of collaboration**:
- **Scale**:
- **Our personal collaboration as a team**: 

## Contributions
- **Amanda**: Came up with the idea for PhotoBucket and created the Figma mockup and Style Guide for the application before development. Implemented the fetching of storage for the images in the Bucket Gallery so they are store per user and not locally. Implemented the responsive and animated UI aspects (The animated sidebar, the button components), redeveloped the UI after initial implementation that Nia did, to match the aesthetic more to fit the Figma Mockup we had. Completed the README

- **Grace**: Implemented the functionality of the collaboration aspect. Set up backend and database for storage of information. Initial log in 

- **Nia**: Implemented the image uploader modal, made initial design for the pages and components. 

- **Together**: A majority of what we worked on, all of us worked on it together in different pieces. With a majority of the things we implemented 

## Accessibility Features
**Design Achievement 1: Comprehensive Web Accessibility Implementation**

- **Semantic HTML Structure**: Used proper semantic landmarks throughout the application - `<main>` for primary content areas, `<nav>` for navigation (sidebar), `<section>` for distinct content areas (bucket lists, gallery), and `<form>` elements for all input areas including login, signup, and item creation.
- **ARIA Labels and Roles**: Implemented comprehensive ARIA labeling including `aria-label="Bucket list title"` for form inputs, `aria-label="Search photos"` for search functionality, `role="dialog"` and `aria-modal="true"` for modal components (login, signup, completion modals), and `role="menu"` for dropdown interfaces. Each photo gallery item includes descriptive `aria-label={title}, ${date}` for screen reader context.
- **Keyboard Navigation Support**: All interactive elements are keyboard accessible with proper tab order. Modal dialogs trap focus appropriately and can be closed with Escape key. The sidebar navigation supports full keyboard operation with clear focus indicators.
- **Text Alternatives**: Every image includes descriptive `alt` attributes - from functional icons (`alt="Invite"`, `alt="trash"`) to user-uploaded photos (`alt={p.title}`) and brand elements (`alt="PhotoBucket Logo"`). Decorative elements use `aria-hidden` to prevent screen reader confusion.
- **Clear Focus Indicators**: Implemented visible focus states using Tailwind's focus utilities and custom CSS, ensuring keyboard users can clearly see their current position. Buttons include hover states for visual feedback.
- **Descriptive Button Labels**: All action buttons include context - `title="Invite collaborators (max 4)"`, `aria-label="Leave this bucket"`, `title="Delete"` with specific item context, and `aria-label="Clear this bucket"` for bulk actions.
- **Form Accessibility**: All form fields include proper `<label>` elements, and the completion modal uses semantic form structure with labeled inputs for date selection and file uploads.

**Design Achievement 2: CRAP Design Principles Implementation**
- **Contrast**: PhotoBucket uses high contrast design throughout to ensure readability and visual hierarchy. The primary brand color (#0092E0) provides strong contrast against white backgrounds, while the secondary pink (#FF99A7) is reserved for completion states and success indicators. Dark text (#0b1020) on light backgrounds ensures excellent readability. Interactive elements like buttons maintain sufficient contrast ratios, and the animated sidebar uses darker backgrounds to make white text clearly visible.
- **Repetition**: Consistent design patterns create cohesion across the entire application. We use the same font family (Roboto) throughout for both headings and body text, maintaining typographic consistency. Button styles, border radius (rounded-xl), and shadow patterns repeat across all interactive elements. The color palette is limited and purposeful - blue for primary actions, pink for completion/success states, and consistent avatar colors for collaborators. Animation patterns using the Motion library follow the same easing curves and duration across all transitions.
- **Alignment**: Clean alignment principles guide the entire layout structure. The sidebar navigation aligns all elements consistently with proper spacing. The main content area uses a centered container with consistent margins. Bucket list items align in a clean grid with consistent spacing between cards. The gallery view maintains perfect grid alignment with responsive breakpoints. Form elements align their labels and inputs consistently, and modal dialogs center properly in the viewport with aligned content blocks.
- **Proximity**: Related elements are grouped logically throughout the interface. The bucket list header groups the title input with collaboration controls (avatar display, invite button, leave/clear actions). Each bucket item groups its checkbox, content fields, and action buttons together with clear spacing. The gallery view groups related photos by bucket with clear section dividers. Navigation elements in the sidebar are grouped by function, with bucket lists separated from gallery and profile actions. Collaborator information groups names with avatars and ownership indicators in close proximity.

**Technical Achievement: Real-time Collaborative Architecture**
Our implementation of real-time collaboration represents a significant technical challenge that deserves recognition. We built a sophisticated system that allows up to 4 users to simultaneously work on the same bucket lists with seamless data synchronization. The architecture handles complex state management across multiple users, including:
- **Complex Permission System**: Dynamic ownership and collaborator roles with granular permissions - owners can invite/remove collaborators, all collaborators can add/edit items, and proper access control for photo gallery management.
- **Invite Code System**: Secure invitation mechanism using cryptographically generated codes with expiration dates, allowing users to share buckets while maintaining security and preventing unauthorized access.
- **Data Integrity**: Sophisticated conflict resolution when multiple users edit simultaneously, proper session management across multiple clients, and atomic operations for critical actions like adding/removing collaborators.
- **Scalable Database Design**: MongoDB schema designed to handle complex relationships between users, buckets, items, and images while maintaining performance as collaboration grows.

**Technical Achievement 2: Image Upload System**
- **Dual Capture Methods**: Implemented both file upload and live camera capture functionality within a single modal interface. The system dynamically switches between native file picker and WebRTC camera access, providing users flexibility in how they document their bucket list completions.
- **Cloud Storage Integration**: Built a Cloudinary integration using multer-storage-cloudinary that handles file processing, format validation (jpg, png, jpeg), and automatic optimization. The system manages secure uploads with proper error handling and provides immediate URL feedback for real-time UI updates.
- **Real-time Preview System**: Developed instant image preview functionality that displays uploaded images immediately within the completion modal, allowing users to verify their photo before final submission. The preview system handles both file uploads and camera captures uniformly.

## References/Important Links
Figma Mockup : https://www.figma.com/design/4SymLPWVNrYCYjMMBHQE2A/Web-Mockup?node-id=0-1&t=jODCAautp2idziX2-1 
Figma Mockup for Style Guide : https://www.figma.com/design/MLq5vvR9MYXi92S0DmE85P/Style-Guide?node-id=0-1&t=nhyGXzP7dkdUmdyX-1 
https://www.geeksforgeeks.org/node-js/how-to-store-images-in-mongodb-using-nodejs/ (image upload to mongodb)
