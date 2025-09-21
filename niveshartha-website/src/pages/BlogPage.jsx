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

  const styles = {
    container: { maxWidth: "700px", margin: "0 auto", paddingTop: "80px" },
    title: { fontSize: "28px", fontWeight: "bold", marginTop: "30px", marginBottom: "20px"},
    postCard: {
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #ddd",
    },
    postTitle: {
      fontSize: "22px",
      fontWeight: "600",
      marginBottom: "8px",
      color: "#111",
      textDecoration: "none",
    },
    meta: { color: "#666", fontSize: "14px", marginBottom: "8px" },
    excerpt: { color: "#333", fontSize: "16px", lineHeight: "1.5", paddingTop: "20px" },
  };

  return (
    <div className="min-h-screen bg-white">
      <ScrollAnimation animation="from-bottom" delay={0.4}>
        <div style={styles.container}>
          <h1 style={styles.title}>Blogs</h1>
          {posts.map((post) => (
            <div key={post.id} style={styles.postCard}>
              <Link to={`/blog/${post.id}`} style={styles.postTitle}>
                {post.title}
              </Link>
              <br />
              <Link to={`/blog/${post.id}`} style={styles.meta}>
                By {post.author || "Unknown"} •{" "}
                {post.createdAt?.toDate().toLocaleDateString()}
              </Link>
              <p style={styles.excerpt}>
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
