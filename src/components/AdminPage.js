import React, { useState } from 'react';
import { Card, Button, Input, Modal } from 'antd';

const AdminPage = () => {
  const [images, setImages] = useState([]);
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [comments, setComments] = useState([]);

  // トークンを検証する関数
  const verifyToken = () => {
    fetch('https://shogikaisetukun.fly.dev/api/verify_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    .then(response => {
      if (response.ok) {
        setIsAuthenticated(true);
        fetchImages();
      } else {
        alert('トークンが無効です');
      }
    })
    .catch(error => {
      console.error('トークンの検証に失敗しました:', error);
    });
  };

  // 画像データを取得する関数
  const fetchImages = () => {
    fetch('https://shogikaisetukun.fly.dev/api/images')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
        } else {
          console.error('予期せぬデータ形式:', data);
        }
      })
      .catch(error => console.error('画像の読み込みに失敗しました:', error));
  };

  // 画像を削除する関数
  const handleDelete = (imageId) => {
    fetch(`https://shogikaisetukun.fly.dev/api/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': token }
    })
    .then(response => {
      if (response.ok) {
        setImages(images.filter(image => image.id !== imageId));
      } else {
        alert('画像の削除に失敗しました');
      }
    })
    .catch(error => console.error('画像の削除に失敗しました:', error));
  };

  // コメントデータを取得する関数
  const fetchComments = (imageId) => {
    fetch(`https://shogikaisetukun.fly.dev/api/images/${imageId}/comments`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setComments(data);
        } else {
          console.error('予期せぬデータ形式:', data);
        }
      })
      .catch(error => console.error('コメントの読み込みに失敗しました:', error));
  };

  // モーダルを開く関数
  const showModal = (imageId) => {
    setSelectedImageId(imageId);
    fetchComments(imageId);
    setIsModalVisible(true);
  };

  // モーダルを閉じる関数
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedImageId(null);
    setComments([]);
  };

  return (
    <div>
      {!isAuthenticated && (
        <div>
          <Input
            type="password"
            placeholder="トークンを入力"
            value={token}
            onChange={e => setToken(e.target.value)}
          />
          <Button onClick={verifyToken}>ログイン</Button>
        </div>
      )}
      {isAuthenticated && images.map(image => (
        <Card key={image.id}>
          <img alt="example" src={image.url} style={{ width: '100%', height: 'auto' }} />
          <Button onClick={() => handleDelete(image.id)}>削除</Button>
          <Button onClick={() => showModal(image.id)}>コメントを見る</Button>
        </Card>
      ))}
      <Modal
        title={`コメント - 画像ID: ${selectedImageId}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        {comments.map(comment => (
          <p key={comment.id}>{comment.content}</p>
        ))}
      </Modal>
    </div>
  );
};

export default AdminPage;
