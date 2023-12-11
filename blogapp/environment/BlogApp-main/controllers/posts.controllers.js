const Post = require("../models/post");


const homeStartingContent =
	'The home pages lists all the blogs from all the users.';

const composePost = async (req, res) => {

  const newPost = new Post({
    username: req.user.username,
    title: req.body.title,
    content: req.body.content,
  });

  try {
    await newPost.save(); 
    res.redirect('/post');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const displayAllPosts = async (req, res) => {
  try {
    const post = await Post.scan().exec(); 
    res.render('post', { post });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
async function displayPost(req, res) {
  const requestedPostId = req.params.postId;

  try {
    const post = await Post.get(requestedPostId);
    if (!post) {
      res.status(404).send('Post not found');
      return;
    }

    res.render('post', {
      title: post.title,
      content: post.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


module.exports = {
	displayAllPosts,
	displayPost,
    composePost
};