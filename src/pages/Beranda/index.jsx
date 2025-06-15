import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Divider, List, Skeleton } from 'antd';
import { PlusCircleOutlined, PlayCircleOutlined, PieChartOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';
import { getDataPrivate } from '../../utils/api';

const { Title, Text, Paragraph } = Typography;

const Beranda = () => {
  // Contoh data simulasi untuk statistik mini dan highlight playlist
  const [totalPlaylists, setTotalPlaylists] = useState(125);
  const [availableGenres, setAvailableGenres] = useState(8);
  const [popularGenre, setPopularGenre] = useState('Musik Lo-Fi');
  const [userName, setUserName] = useState('Gita'); // Ganti dengan nama pengguna sebenarnya dari konteks login
  const [userPlaylistsCount, setUserPlaylistsCount] = useState(8); // Ganti dengan jumlah playlist pengguna sebenarnya

  const [highlightPlaylists, setHighlightPlaylists] = useState([]);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);

  useEffect(() => {
    fetchHighlightPlaylists();
  }, []);

  const fetchHighlightPlaylists = () => {
    setIsLoadingHighlights(true);
    getDataPrivate("/api/playlist/49")
      .then((resp) => {
        if (resp?.datas && resp.datas.length > 0) {
          const allVideos = [];
          const genreCounts = {};
          let totalUniqueGenres = 0;

          resp.datas.forEach(playlist => {
            // Asumsi setiap playlist memiliki 'play_url' dan 'play_thumbnail'
            if (playlist.play_url && playlist.play_thumbnail) {
              allVideos.push({
                id: playlist.id_play,
                title: playlist.play_name,
                url: playlist.play_url,
                thumbnail: playlist.play_thumbnail,
                description: playlist.play_description,
                genre: playlist.play_genre
              });
            }
            
            // Hitung genre
            if (playlist.play_genre) {
              genreCounts[playlist.play_genre] = (genreCounts[playlist.play_genre] || 0) + 1;
            }
          });

          // Update Total Playlist Dibuat
          setTotalPlaylists(resp.datas.length);

          // Hitung Genre Tersedia
          totalUniqueGenres = Object.keys(genreCounts).length;
          setAvailableGenres(totalUniqueGenres);

          // Hitung Genre Terpopuler
          let mostPopularGenre = '-';
          let maxCount = 0;
          for (const genre in genreCounts) {
            if (genreCounts[genre] > maxCount) {
              maxCount = genreCounts[genre];
              mostPopularGenre = genre;
            }
          }
          setPopularGenre(mostPopularGenre);

          // Pilih 3 video acak jika ada lebih dari 3 video, atau semua jika kurang
          const selectedVideos = [];
          const tempVideos = [...allVideos];
          const numToSelect = Math.min(3, tempVideos.length);

          for (let i = 0; i < numToSelect; i++) {
            const randomIndex = Math.floor(Math.random() * tempVideos.length);
            selectedVideos.push(tempVideos[randomIndex]);
            tempVideos.splice(randomIndex, 1); // Hapus video yang sudah dipilih
          }
          setHighlightPlaylists(selectedVideos);
        } else {
          setHighlightPlaylists([]); // Tidak ada data atau playlist kosong
          setTotalPlaylists(0);
          setAvailableGenres(0);
          setPopularGenre('-');
        }
        setIsLoadingHighlights(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil data playlist untuk highlight:", err);
        setIsLoadingHighlights(false);
        setHighlightPlaylists([]);
        setTotalPlaylists(0);
        setAvailableGenres(0);
        setPopularGenre('-');
      });
  };

  return (
    <div className="layout-content">
      <Row gutter={[24, 0]}>
        <Col xs={24} md={24} lg={24} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={2}>Selamat Datang di Zona Playlist-mu!</Title>
              <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                Jelajahi, Buat, dan Atur Playlist Favoritmu dengan mudah.
              </Paragraph>
              {/* Gambar Hero Placeholder */}
              <img 
                src="/src/assets/images/code&chaoz3.png"
                alt="Code and Chaoz"
                style={{ 
                  width: '100%', 
                  maxWidth: '700px', 
                  height: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px', 
                  marginTop: '70px', 
                  marginBottom: '45px'
                }}
              />
            </div>

            <Divider orientation="left" style={{ fontSize: '25px' }}>Akses Cepat</Divider>
            <Row gutter={[16, 16]} justify="center" style={{ marginTop: '40px', marginBottom: '40px' }}>
              <Col>
                <NavLink to="/playlist">
                  <div
                    style={{
                      width: 200,
                      height: 150,
                      background: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.2)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.border = '1px solid #e0e0e0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.border = '1px solid #f0f0f0';
                    }}
                  >
                    <EditOutlined style={{ fontSize: '48px', marginBottom: '8px', color: '#1890ff' }} />
                    <Text strong>Buat Playlist</Text>
                  </div>
                </NavLink>
              </Col>
              <Col>
                <NavLink to="/playlist-view">
                  <div
                    style={{
                      width: 200,
                      height: 150,
                      background: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.2)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.border = '1px solid #e0e0e0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.border = '1px solid #f0f0f0';
                    }}
                  >
                    <PlayCircleOutlined style={{ fontSize: '48px', marginBottom: '8px', color: '#1890ff' }} />
                    <Text strong>Lihat Galeri Playlist</Text>
                  </div>
                </NavLink>
              </Col>
              <Col>
                <NavLink to="/playlist-stats">
                  <div
                    style={{
                      width: 200,
                      height: 150,
                      background: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: '1px solid #f0f0f0',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
                      e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.2)';
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.border = '1px solid #e0e0e0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.border = '1px solid #f0f0f0';
                    }}
                  >
                    <PieChartOutlined style={{ fontSize: '48px', marginBottom: '8px', color: '#1890ff' }} />
                    <Text strong>Cek Statistik</Text>
                  </div>
                </NavLink>
              </Col>
            </Row>

            <Divider orientation="left" style={{fontSize: '25px', marginTop: '20px', marginBottom: '35px'}}>Highlight Pilihan</Divider>
            {isLoadingHighlights ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
                dataSource={[1, 2, 3]} // Data dummy untuk skeleton
                renderItem={() => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={<div style={{ height: '180px', background: '#f0f2f5' }} />}
                      title={<Skeleton.Input style={{ width: '80%' }} active size="small" />}
                    >
                      <Skeleton active paragraph={{ rows: 2 }} title={false} />
                    </Card>
                  </List.Item>
                )}
              />
            ) : highlightPlaylists.length > 0 ? (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}
                dataSource={highlightPlaylists}
                renderItem={item => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <img 
                            alt={item.title} 
                            src={item.thumbnail} 
                            style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                          />
                        </a>
                      }
                      title={item.title}
                    >
                      <Paragraph ellipsis={{ rows: 2 }}>{item.description}</Paragraph>
                      <Text type="secondary">Genre: {item.genre}</Text>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Paragraph>Tidak ada highlight playlist untuk ditampilkan saat ini.</Paragraph>
            )}

            <Divider orientation="left" style={{ fontSize: '25px', marginTop: '40px', marginBottom: '40px'  }}>Ringkasan Statistik</Divider>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Text strong>Total Playlist Dibuat:</Text><br/>
                  <Title level={4}>{totalPlaylists}</Title>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Text strong>Genre Tersedia:</Text><br/>
                  <Title level={4}>{availableGenres}</Title>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card hoverable>
                  <Text strong>Genre Terpopuler:</Text><br/>
                  <Title level={4}>{popularGenre}</Title>
                </Card>
              </Col>
            </Row>

          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Beranda; 