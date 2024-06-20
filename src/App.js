import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import { UserProvider } from './components/UserContext';
import Home from './components/Home';
import PostDetail from './components/PostDetail';
import CategoryPosts from './components/CategoryPosts';
import UserDetail from './components/UserDetail'
import Login from './components/Login';
import Register from './components/Registration';
import CreatePost from './components/CreatePost';
import UpdatePost from './components/UpdatePost';
import SearchResults from './components/SearchResults';
import UserChats from './components/UserChats';
import Chat from './components/Chat';
import AdminPanel from './components/AdminPanel';
import ManageCategories from './components/ManageCategories';
import CreateAdmin from './components/CreateAdmin';
import { AdminRoute } from './components/ProtectedRoutes';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/posts/:id/edit" element={<UpdatePost />} />
          <Route path="/categorie/:id" element={<CategoryPosts />} />
          <Route path="/user/:id" element={<UserDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/chats" element={<UserChats />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/admin/*" element={<AdminRoute />}>
            <Route path="" element={<AdminPanel />} />
            <Route path="categories" element={<ManageCategories />} /> 
            <Route path="create-admin" element={<CreateAdmin />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;