import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import ScrollAnimation from '../components/ScrollAnimation';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ScrollAnimation animation="from-bottom" delay={0.4}>
        <div className="max-w-5xl mx-auto pt-20 px-4">
          <h1 className="text-3xl font-bold mt-8 mb-5">Blogs</h1>
          {posts.map((post) => (
            <div key={post.id} className="mb-6 pb-4 border-b border-gray-300">
              <Link to={`/blog/${post.id}`} className="text-xl font-semibold mb-2 text-gray-900 transition-colors duration-300 hover:text-[#008080]" >
                {post.title}
              </Link>
              <br />
              <Link to={`/blog/${post.id}`} className="text-sm text-gray-600 block mt-1">
                By {post.author || "Unknown"} •{" "}
                {post.createdAt?.toDate().toLocaleDateString()}
              </Link>
              <p className="text-gray-800 text-base leading-relaxed pt-4">
                {post.content.length > 120
                  ? post.content.substring(0, 120) + "..."
                  : post.content}
              </p>
            </div>
          ))}
        </div>
      </ScrollAnimation>
    </div>
  );
}
