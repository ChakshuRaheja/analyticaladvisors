// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { db } from "../firebase/config";
// import ScrollAnimation from '../components/ScrollAnimation';

// const BlogDetailPage = () => {
//   const { id } = useParams();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPost = async () => {
//       try {
//         const docRef = doc(db, "blogPosts", id);
//         const snapshot = await getDoc(docRef);
//         if (snapshot.exists()) {
//           setPost({ id: snapshot.id, ...snapshot.data() });
//         } else {
//           setPost(null);
//         }
//       } catch (error) {
//         console.error("Error fetching blog post:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPost();
//   }, [id]);

//   const styles = {
//     container: { maxWidth: "700px", margin: "0 auto", padding: "20px" },
//     title: { fontSize: "28px", fontWeight: "bold", marginBottom: "12px" },
//     meta: { fontSize: "14px", color: "#666", marginBottom: "16px", lineHeight: "3"},
//     content: { fontSize: "16px", lineHeight: "2", color: "#333" },
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!post) return <p>Post not found</p>;

//   return (
//     <div className = "py-24 min-h-screen bg-white">
//       <ScrollAnimation animation="from-bottom" delay={0.4}>
//         <div className="max-w-5xl mx-auto pt-20 px-4">
//           <h1 style={styles.title}>{post.title}</h1>
//           <p style={styles.meta}>
//               By {post.author || "Unknown"} on{" "}
//               {post.createdAt?.toDate
//               ? post.createdAt.toDate().toLocaleDateString()
//               : "No date"}
//           </p>
//           <pre style={{fontFamily: 'Helvetica, Arial, sans-serif', whiteSpace: 'pre-wrap', ...styles.content}}>{post.content}</pre>
//         </div>
//       </ScrollAnimation>
//     </div>
//   );
// };

// export default BlogDetailPage;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import ScrollAnimation from '../components/ScrollAnimation';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "blogPosts", id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setPost({ id: snapshot.id, ...snapshot.data() });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const styles = {
    title: { fontSize: "32px", fontWeight: "bold", marginBottom: "12px" },
    meta: { fontSize: "14px", color: "#666", marginBottom: "20px" },
    contentWrapper: {
      fontSize: "18px",
      lineHeight: "1.8",
      color: "#222",
      marginTop: "20px"
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div className="py-24 min-h-screen bg-white">
      <ScrollAnimation animation="from-bottom" delay={0.4}>
        <div className="max-w-4xl mx-auto px-4">
          
          <h1 style={styles.title}>{post.title}</h1>

          <p style={styles.meta}>
            By {post.author || "Unknown"} on{" "}
            {post.createdAt?.toDate
              ? post.createdAt.toDate().toLocaleDateString()
              : "No date"}
          </p>

          {/* 👇 THIS allows HTML + inline CSS to render */}
          <div
            style={styles.contentWrapper}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </div>
      </ScrollAnimation>
    </div>
  );
};

export default BlogDetailPage;
