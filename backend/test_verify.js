import axios from 'axios';

async function runTest() {
  try {
    console.log("1. Registering dummy user...");
    const authRes = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'tester123',
      email: 'tester123@gmail.com',
      password: 'password123'
    });
    const token = authRes.data.token;
    console.log("✅ User registered. Token acquired.");

    console.log("\n2. Creating a post...");
    const postRes = await axios.post('http://localhost:5000/api/posts', 
      { content: "Scandal breaks out over completely false allegations." },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const postId = postRes.data._id;
    console.log("✅ Post created. Post ID:", postId);

    console.log("\n3. Testing 'Verify Post' AI integration...");
    const verifyRes = await axios.post(`http://localhost:5000/api/posts/${postId}/verify`, 
      { content: postRes.data.content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("✅ Verification Successful!");
    console.log(verifyRes.data);

  } catch (err) {
    console.error("❌ Test Failed:");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

runTest();
