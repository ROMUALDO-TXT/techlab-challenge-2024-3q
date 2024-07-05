import Navbar from '../components/Navbar/Navbar.tsx';
import Footer from '../components/Footer/Footer.tsx';
import { Chat } from '../components/Chat/Chat.tsx';

console.log('home')

const Home = () => {
    return (
        <div className="Home">
            <Navbar />
            <Chat conversationId={'550e8400-e29b-41d4-a716-446655440031'} />
            <Footer />
        </div>
    );
}

export default Home;