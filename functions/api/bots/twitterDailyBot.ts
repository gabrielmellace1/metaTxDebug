// export async function onRequestPost(context) {
//     const url = "https://api.twitter.com/2/tweets";
//     const bearerToken = context.env.TWITTER_BEARER_TOKEN;  // Ensure your bearer token is stored in environment variables
//     const tweetData = {
//         text: "Town is growing! This is how Squares town is looking today " + new Date().toLocaleDateString()
//     };

//     const response = await fetch(url, {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${bearerToken}`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(tweetData)
//     });

//     if (!response.ok) {
//         const errorMessage = await response.text();
//         throw new Error(`Failed to post tweet: ${errorMessage}`);
//     }

//     const result = await response.json();
//     return new Response(JSON.stringify(result), {
//         status: 200,
//         headers: {
//             "Content-Type": "application/json"
//         }
//     });
// }

// //Client id: T005dllEcU9rWjZSNGNnZ1RTbWw6MTpjaQ
// //client secret: Jc_QrsJArb1NMVzhvhzAa9AAWvPy7LIV-CQ6BfDZRCF2PzrdOF
// // API Key ecLx8sYIN61Xr99I9H93flJOC
// //API Key Secret CUYVtGmTyNVeE2fyJmMZZAN7B5HORN2TjE7x6qApaNWGINubsS
// //Bearer token AAAAAAAAAAAAAAAAAAAAAObxtQEAAAAAd5sLcbsR21n5FuerdzmP%2FHbAq5g%3D81POGWREga9d408WihbxaqxzDfANu5WzzhscCRLZLkDwDvRL7D

// Access Token 1783245126690643968-D7sVliY6cM6xYSW26DCCkOsrhkic9r
// Access Token Secret RVIro85KvJEyDffhexpcBVJeC4NZI3b9AMr36ExoUWkk