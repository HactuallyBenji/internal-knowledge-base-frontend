import logo from './logo.svg';
import './App.css';
import MyEditor from './components/MyEditor/MyEditor';
import Article from './components/Article/Article';
import postFunctions from './rest/post';
import getFunctions from './rest/get';
import { useState } from 'react';
import { Editor, EditorState } from 'draft-js';
import Authentication from './components/Authentication/Authentication';

function App() {
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty(),
  );

  const [articleBody, setArticleBody] = useState('');
	const [articleSubject, setArticleSubject] = useState('');

  const [articleList, setArticleList] = useState([]);
  
  const [selectedArticleForComments, setSelectedArticleForComments] = useState(1);
  const [comments, setComments] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState('ENGINEERING');

  const [articleType, setArticleType] = useState(selectedDepartment);

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  }

  const handleArticleTypeChange = (event) => {
    setArticleType(event.target.value);
  }

  const getArticlesForSelectedDepartment = async () => {
    setArticleList(await getFunctions.getArticlesByDepartment(selectedDepartment));
  }

  const handleArticleClick = async (articleID) => {
    console.log(articleID);
    setSelectedArticleForComments(articleID);
    setComments(await getFunctions.getCommentsByArticleID(articleID));
  }

  const handleDeletion = async (articleID) => {
    if (window.confirm("Are you sure you wish to delete this article?") == true) {
      await postFunctions.deleteArticleByID(articleID);
    }
  }

  const handleRead = async (articleID) => {
    await postFunctions.setArticleRead(articleID);
  }

  const handleUnread = async (articleID) => {
    await postFunctions.setArticleUnread(articleID);
  }

  const handleEditorKeyPress = (event) => {
    if (event.key == 'Tab') {
      event.preventDefault();
      event.target.value += "    ";
    }
  }

  return (
    <div className="App">
      <div className="Split ArticleSection">
        
        <Authentication 
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={handleDepartmentChange}
        />
        
        <div className="FetchArticles">
          <button onClick={getArticlesForSelectedDepartment}>
            GET ARTICLES
          </button>
        </div>

        <div className="Text-Editor">
          <MyEditor 
            articleBody={articleBody} 
            articleSubject={articleSubject} 
            setArticleBody={setArticleBody}
            setArticleSubject={setArticleSubject}
            handleTabKeyPress={handleEditorKeyPress}
          />
        </div>

        <div className="Department-Selection">
          <input type="radio" value="ENGINEERING" name="department" onChange={handleArticleTypeChange}/> Engineering
          <input type="radio" value="MARKETING" name="department" onChange={handleArticleTypeChange}/> Marketing
          <input type="radio" value="SALES" name="department" onChange={handleArticleTypeChange}/> Sales
          <input type="radio" value="Data Science" name="department" onChange={handleArticleTypeChange}/> Data Science

          <br />

          <button onClick={() => postFunctions.createNewArticle(
            articleSubject,
            articleBody,
            articleType,
            "F"
          )}>
            POST NEW ARTICLE
          </button>
        </div>

        <div className="Articles">
          {articleList.sort((a,b) => a.readStatus > b.readStatus ? 1 : -1).map((article) => {
            return (
              <Article
                key={article.articleID}
                articleID={article.articleID}
                articleSubject={article.articleSubject}
                articleBody={article.articleBody}
                readStatus={article.readStatus}
                selectedArticleForComments={selectedArticleForComments}
                handleDeletion={handleDeletion}
                handleRead={handleRead}
                handleUnread={handleUnread}
                handleArticleClick={handleArticleClick}
              />
            );
          })}
        </div>
      </div>
      <div className="Split CommentSection">
        Comments
        <br />
        <ul>
          {comments.map((comment) => {
            return (
              <li key={comment.commentID}>{comment.commentBody}</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
