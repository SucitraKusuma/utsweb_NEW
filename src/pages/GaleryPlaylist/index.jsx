import { Col, Row, Typography, Card, List, Divider, Skeleton, Input, Button, notification, Tabs } from "antd";
import { getDataPrivate } from "../../utils/api";
import { useState, useEffect } from "react";
import { SearchOutlined, PlayCircleOutlined, CustomerServiceOutlined, SoundOutlined, VideoCameraOutlined, ReadOutlined, AppstoreOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PlaylistView = () => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [genrePlaylists, setGenrePlaylists] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [selectedGenre, setSelectedGenre] = useState(null);

  const genreOptions = [
    { value: 'music', label: 'Music', color: '#0088FE' },
    { value: 'song', label: 'Song', color: '#FFBB28' },
    { value: 'movie', label: 'Movie', color: '#FF8042' },
    { value: 'education', label: 'Education', color: '#8884d8' },
    { value: 'others', label: 'Others', color: '#00C49F' }
  ];

  const getGenreIcon = (genre) => {
    const genreOption = genreOptions.find(g => g.value === genre);
    const iconStyle = {
      fontSize: '32px',
      marginBottom: '8px',
      color: selectedGenre === genre ? genreOption?.color : '#8c8c8c',
      transition: 'all 0.3s ease'
    };

    switch (genre) {
      case 'music':
        return <CustomerServiceOutlined style={iconStyle} />;
      case 'song':
        return <SoundOutlined style={iconStyle} />;
      case 'movie':
        return <VideoCameraOutlined style={iconStyle} />;
      case 'education':
        return <ReadOutlined style={iconStyle} />;
      case 'others':
        return <AppstoreOutlined style={iconStyle} />;
      default:
        return null;
    }
  };

  const openNotificationWithIcon = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
    });
  };

  useEffect(() => {
    getDataPlaylist();
  }, []);

  const getDataPlaylist = () => {
    setIsLoading(true);
    getDataPrivate("/api/playlist/49")
      .then((resp) => {
        if (resp?.datas) {
          setAllPlaylists(resp.datas);
          // Inisialisasi data per genre
          const genreData = {};
          genreOptions.forEach(genre => {
            genreData[genre.value] = resp.datas.filter(item => item.play_genre === genre.value);
          });
          setGenrePlaylists(genreData);
        } else {
          openNotificationWithIcon("error", "Error", "Gagal mengambil data playlist");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        openNotificationWithIcon("error", "Error", "Terjadi kesalahan saat mengambil data playlist");
        setIsLoading(false);
      });
  };

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
  };
  
  const filterPlaylists = (playlists) => {
    return playlists.filter((item) => {
      return item?.play_name?.toLowerCase().includes(searchText);
    });
  };

  const renderGenreFolders = () => (
    <List
      grid={{ gutter: 16, xl: 5, lg: 4, md: 3, sm: 2, xs: 1 }}
      dataSource={genreOptions}
      renderItem={(genre) => (
        <List.Item>
          <Card
            hoverable
            onClick={() => handleGenreClick(genre.value)}
            style={{
              textAlign: 'center',
              backgroundColor: selectedGenre === genre.value ? '#f0f2f5' : 'white',
              borderColor: selectedGenre === genre.value ? genre.color : '#d9d9d9',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }
            }}
            bodyStyle={{
              padding: '20px',
              '&:hover': {
                backgroundColor: '#fafafa'
              }
            }}
          >
            {getGenreIcon(genre.value)}
            <div style={{ 
              color: selectedGenre === genre.value ? genre.color : 'inherit',
              fontWeight: selectedGenre === genre.value ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}>
              {genre.label}
            </div>
            <Text type="secondary">({genrePlaylists[genre.value]?.length || 0} playlist)</Text>
          </Card>
        </List.Item>
      )}
    />
  );

  const renderPlaylists = (playlists) => (
    <>
      <Input
        prefix={<SearchOutlined />}
        placeholder="Cari playlist..."
        allowClear
        size='large'
        onChange={(e) => handleSearch(e.target.value)}
        style={{ marginBottom: '16px' }}
      />

      {isLoading ? (
        <Skeleton active />
      ) : (
        <List
          grid={{ gutter: 0, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={filterPlaylists(playlists)}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1 }}
              >
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
                  {item.play_name}
                </div>
                <div style={{ height: '140px', overflow: 'hidden', marginBottom: 8 }}>
                  <img
                    alt={item.play_name}
                    src={item.play_thumbnail}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <Card.Meta
                  description={
                    <>
                      <div>{item.play_description}</div>
                      <div style={{ marginTop: 3 }}>
                        <Text type="secondary">Genre: {item.play_genre}</Text>
                      </div>
                    </>
                  }
                />
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                  <a href={item.play_url} target="_blank" rel="noopener noreferrer">
                    <Button type="text" icon={<PlayCircleOutlined />}>Play</Button>
                  </a>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </>
  );

  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <Title>Galeri Playlist</Title>
            <Text style={{ fontSize: "12pt" }}>Jelajahi berbagai koleksi video dalam galeri playlist – mulai dari musik santai hingga tutorial hacking!</Text>
            <Divider />
            
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Semua Genre',
                  children: renderPlaylists(allPlaylists),
                },
                {
                  key: '2',
                  label: 'Pilih Genre',
                  children: (
                    <>
                      {renderGenreFolders()}
                      {selectedGenre && (
                        <>
                          <Divider />
                          <Title level={4}>Playlist {genreOptions.find(g => g.value === selectedGenre)?.label}</Title>
                          {renderPlaylists(genrePlaylists[selectedGenre] || [])}
                        </>
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlaylistView;