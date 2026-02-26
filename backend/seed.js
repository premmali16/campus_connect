const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Group = require('./models/Group');
const Resource = require('./models/Resource');
const Opportunity = require('./models/Opportunity');

/**
 * Seed database with sample data for development/demo
 */
const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Post.deleteMany({}),
            Comment.deleteMany({}),
            Group.deleteMany({}),
            Resource.deleteMany({}),
            Opportunity.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data');

        // Create users
        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@campusconnect.com',
                password: 'admin123',
                role: 'admin',
                college: 'IIT Delhi',
                branch: 'Computer Science',
                year: '4th Year',
                bio: 'Platform administrator and CS enthusiast',
                skills: ['React', 'Node.js', 'MongoDB', 'Python'],
                interests: ['Web Development', 'AI/ML', 'Open Source'],
                points: 500,
            },
            {
                name: 'Aarav Sharma',
                email: 'aarav@student.com',
                password: 'student123',
                role: 'student',
                college: 'IIT Bombay',
                branch: 'Computer Science',
                year: '3rd Year',
                bio: 'Full-stack developer passionate about building impactful products.',
                skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Docker'],
                interests: ['Web Development', 'Cloud Computing', 'Startups'],
                points: 250,
            },
            {
                name: 'Priya Patel',
                email: 'priya@student.com',
                password: 'student123',
                role: 'student',
                college: 'NIT Trichy',
                branch: 'Electronics',
                year: '2nd Year',
                bio: 'IoT enthusiast and competitive programmer.',
                skills: ['C++', 'Python', 'Arduino', 'MATLAB'],
                interests: ['Competitive Programming', 'Embedded Systems', 'Robotics'],
                points: 180,
            },
            {
                name: 'Rahul Verma',
                email: 'rahul@student.com',
                password: 'student123',
                role: 'student',
                college: 'BITS Pilani',
                branch: 'Mechanical',
                year: '4th Year',
                bio: 'Design thinking advocate and CAD expert.',
                skills: ['SolidWorks', 'AutoCAD', 'Python', 'ANSYS'],
                interests: ['3D Printing', 'Product Design', 'Sustainability'],
                points: 120,
            },
            {
                name: 'Ananya Singh',
                email: 'ananya@student.com',
                password: 'student123',
                role: 'student',
                college: 'IIT Madras',
                branch: 'Computer Science',
                year: '1st Year',
                bio: 'AI/ML enthusiast exploring the world of deep learning.',
                skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
                interests: ['Artificial Intelligence', 'Research', 'Neural Networks'],
                points: 90,
            },
        ]);
        console.log(`👥 Created ${users.length} users`);

        // Create posts
        const posts = await Post.create([
            {
                author: users[1]._id,
                title: 'Best Resources for Learning React in 2024',
                content: 'Hey everyone! I have been learning React for the past few months and wanted to share some amazing resources that helped me. The official React docs are incredible now with the new tutorial format. Also check out Josh Comeau\'s Joy of React course - it\'s worth every penny. For state management, I recommend starting with Context API before jumping to Redux.',
                tags: ['react', 'frontend', 'resources'],
                category: 'Technical',
                likesCount: 15,
                views: 120,
            },
            {
                author: users[2]._id,
                title: 'Competitive Programming Tips for Beginners',
                content: 'Starting competitive programming? Here are my top tips:\n\n1. Master the basics - arrays, strings, sorting\n2. Learn STL in C++ - it saves so much time\n3. Practice on Codeforces and LeetCode daily\n4. Start with Div 2 A and B problems\n5. Don\'t skip the editorial even if you solve the problem\n\nConsistency is key. Even 1 problem a day makes a huge difference over time!',
                tags: ['competitive-programming', 'coding', 'tips'],
                category: 'Academic',
                likesCount: 22,
                views: 250,
            },
            {
                author: users[0]._id,
                title: '🎉 Welcome to Campus Connect!',
                content: 'Welcome to our student community platform! This is the place where students from different colleges can connect, share knowledge, and grow together. Feel free to:\n\n- Share your learnings and resources\n- Create or join study groups\n- Post about opportunities (internships, hackathons, events)\n- Chat with peers in real-time\n\nLet\'s build an amazing community together! 🚀',
                tags: ['welcome', 'community', 'announcement'],
                category: 'Announcements',
                likesCount: 45,
                views: 500,
                isPinned: true,
            },
            {
                author: users[3]._id,
                title: 'How I Got My First Internship at Google',
                content: 'After months of preparation, I finally landed an internship at Google! Here\'s my journey:\n\n**Preparation Timeline:**\n- Started DSA 6 months before\n- Solved 300+ LeetCode problems\n- Did 2 mock interviews per week\n- Built 3 solid projects\n\n**Interview Process:**\n- Online Assessment (2 Medium + 1 Hard)\n- 2 Technical Rounds (45 min each)\n- 1 Behavioral Round\n\n**Key Tips:**\n- Think out loud during interviews\n- Ask clarifying questions\n- Test edge cases\n- Be genuine in behavioral rounds',
                tags: ['internship', 'google', 'career'],
                category: 'Career',
                likesCount: 67,
                views: 890,
            },
            {
                author: users[4]._id,
                title: 'Introduction to Neural Networks - Study Notes',
                content: 'Sharing my notes from the Deep Learning course. Topics covered:\n\n1. Perceptrons and activation functions\n2. Backpropagation algorithm\n3. Gradient descent variants (SGD, Adam, RMSprop)\n4. Regularization techniques (Dropout, L2)\n5. CNNs for image classification\n\nI\'ve also uploaded the PDF notes in the Resources section. Feel free to ask doubts!',
                tags: ['deep-learning', 'ai', 'notes'],
                category: 'Academic',
                likesCount: 30,
                views: 340,
            },
        ]);
        console.log(`📝 Created ${posts.length} posts`);

        // Create comments
        const comments = await Comment.create([
            {
                post: posts[0]._id,
                author: users[2]._id,
                content: 'Great resource list! I\'d also recommend Scrimba for interactive tutorials.',
            },
            {
                post: posts[0]._id,
                author: users[4]._id,
                content: 'Thanks for sharing! The new React docs are really good.',
            },
            {
                post: posts[1]._id,
                author: users[1]._id,
                content: 'Solid advice! I\'d add that understanding time complexity is crucial before diving into problems.',
            },
            {
                post: posts[3]._id,
                author: users[1]._id,
                content: 'Congratulations! This is really inspiring. How long did you prepare for DSA?',
            },
            {
                post: posts[3]._id,
                author: users[4]._id,
                content: 'Amazing journey! Could you share your LeetCode problem list?',
            },
        ]);

        // Update comment counts
        await Post.findByIdAndUpdate(posts[0]._id, { commentsCount: 2 });
        await Post.findByIdAndUpdate(posts[1]._id, { commentsCount: 1 });
        await Post.findByIdAndUpdate(posts[3]._id, { commentsCount: 2 });
        console.log(`💬 Created ${comments.length} comments`);

        // Create groups
        const groups = await Group.create([
            {
                name: 'DSA Champions',
                description: 'A group for competitive programming enthusiasts. We solve daily problems and discuss solutions.',
                creator: users[1]._id,
                admins: [users[1]._id],
                members: [users[1]._id, users[2]._id, users[4]._id],
                category: 'Study',
                tags: ['dsa', 'algorithms', 'competitive-programming'],
            },
            {
                name: 'Web Dev Wizards',
                description: 'Full-stack web development group. Share projects, get code reviews, and learn together.',
                creator: users[1]._id,
                admins: [users[1]._id],
                members: [users[1]._id, users[0]._id, users[3]._id],
                category: 'Technical',
                tags: ['web', 'react', 'nodejs', 'fullstack'],
            },
            {
                name: 'AI/ML Research Group',
                description: 'Exploring artificial intelligence and machine learning. Paper reading sessions every weekend.',
                creator: users[4]._id,
                admins: [users[4]._id],
                members: [users[4]._id, users[0]._id, users[2]._id],
                category: 'Study',
                tags: ['ai', 'ml', 'deep-learning', 'research'],
            },
            {
                name: 'Placement Prep 2025',
                description: 'Preparing for campus placements together. Mock interviews, resume reviews, and experience sharing.',
                creator: users[3]._id,
                admins: [users[3]._id],
                members: [users[3]._id, users[1]._id, users[2]._id, users[0]._id],
                category: 'Study',
                tags: ['placements', 'interviews', 'career'],
            },
        ]);
        console.log(`👥 Created ${groups.length} groups`);

        // Create resources
        const resources = await Resource.create([
            {
                title: 'Data Structures & Algorithms Complete Notes',
                description: 'Comprehensive DSA notes covering arrays, linked lists, trees, graphs, DP, and more.',
                type: 'pdf',
                subject: 'Data Structures',
                category: 'Computer Science',
                uploadedBy: users[1]._id,
                downloads: 150,
                averageRating: 4.5,
                tags: ['dsa', 'algorithms', 'notes'],
            },
            {
                title: 'React.js Cheat Sheet',
                description: 'Quick reference for React hooks, lifecycle, state management, and common patterns.',
                type: 'pdf',
                subject: 'Web Development',
                category: 'Computer Science',
                uploadedBy: users[1]._id,
                downloads: 89,
                averageRating: 4.2,
                tags: ['react', 'cheatsheet', 'frontend'],
            },
            {
                title: 'Linear Algebra MIT OCW Lectures',
                description: 'Link to MIT OpenCourseWare Linear Algebra lectures by Prof. Gilbert Strang',
                type: 'link',
                subject: 'Mathematics',
                category: 'Mathematics',
                externalLink: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
                uploadedBy: users[4]._id,
                downloads: 200,
                averageRating: 4.8,
                tags: ['linear-algebra', 'math', 'mit'],
            },
            {
                title: 'Python for Data Science - Complete Guide',
                description: 'Covers NumPy, Pandas, Matplotlib, Scikit-learn with practical examples.',
                type: 'notes',
                subject: 'Data Science',
                category: 'Computer Science',
                uploadedBy: users[4]._id,
                downloads: 120,
                averageRating: 4.3,
                tags: ['python', 'data-science', 'ml'],
            },
        ]);
        console.log(`📚 Created ${resources.length} resources`);

        // Create opportunities
        const opportunities = await Opportunity.create([
            {
                title: 'Google Summer of Code 2025',
                description: 'Google Summer of Code is a global program focused on bringing student developers into open source software development. Students work with an open source organization on a 12+ week programming project during their break from school.',
                type: 'internship',
                company: 'Google',
                location: 'Remote',
                link: 'https://summerofcode.withgoogle.com/',
                deadline: new Date('2025-04-15'),
                stipend: '$1500 - $3300',
                postedBy: users[0]._id,
                tags: ['google', 'open-source', 'coding'],
            },
            {
                title: 'HackMIT 2025',
                description: 'Annual hackathon organized by MIT. Build something amazing in 24 hours with 1000+ hackers from around the world.',
                type: 'hackathon',
                company: 'MIT',
                location: 'Cambridge, MA / Virtual',
                link: 'https://hackmit.org/',
                deadline: new Date('2025-08-01'),
                postedBy: users[1]._id,
                tags: ['hackathon', 'mit', 'innovation'],
            },
            {
                title: 'Amazon SDE Intern - Summer 2025',
                description: 'Software Development Engineer internship at Amazon. Work on real-world projects that impact millions of customers globally.',
                type: 'internship',
                company: 'Amazon',
                location: 'Bangalore / Hyderabad',
                link: 'https://amazon.jobs/en/teams/internships-for-students',
                deadline: new Date('2025-03-30'),
                stipend: '₹60,000 - ₹80,000/month',
                postedBy: users[0]._id,
                tags: ['amazon', 'sde', 'internship'],
            },
            {
                title: 'National Science Scholarship 2025',
                description: 'Scholarship for outstanding students in STEM fields. Covers tuition fees and provides monthly stipend.',
                type: 'scholarship',
                company: 'Government of India',
                location: 'India',
                deadline: new Date('2025-06-30'),
                stipend: '₹20,000/month + tuition',
                postedBy: users[0]._id,
                tags: ['scholarship', 'stem', 'funding'],
            },
        ]);
        console.log(`🎯 Created ${opportunities.length} opportunities`);

        console.log('\n✅ Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('  Admin: admin@campusconnect.com / admin123');
        console.log('  Student: aarav@student.com / student123');
        console.log('  Student: priya@student.com / student123');
        console.log('  Student: rahul@student.com / student123');
        console.log('  Student: ananya@student.com / student123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDatabase();
