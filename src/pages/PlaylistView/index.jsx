import { Col, Row, Typography, Card, List, Divider, Skeleton, Input, Button, notification, Tabs } from "antd";
import { getDataPrivate } from "../../utils/api";
import { useState, useEffect } from "react";
import { SearchOutlined, PlayCircleOutlined, FolderOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PlaylistView = () => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [genrePlaylists, setGenrePlaylists] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [api, contextHolder] = notification.useNotification();
  const [selectedGenre, setSelectedGenre] = useState(null);

  const genreOptions = [
    { value: 'music', label: 'Music' },
    { value: 'song', label: 'Song' },
    { value: 'movie', label: 'Movie' },
    { value: 'education', label: 'Education' },
    { value: 'others', label: 'Others' }
  ];

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
              backgroundColor: selectedGenre === genre.value ? '#f0f2f5' : 'white'
            }}
          >
            <FolderOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
            <div>{genre.label}</div>
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
          grid={{ gutter: 16, xl: 4, lg: 3, md: 2, sm: 1, xs: 1 }}
          dataSource={filterPlaylists(playlists)}
          renderItem={(item) => (
            <List.Item>
              <Card
                hoverable
                cover={<img alt={item.play_name} src={item.play_thumbnail} />}
                actions={[
                  <a href={item.play_url} target="_blank" rel="noopener noreferrer">
                    <Button type="text" icon={<PlayCircleOutlined />}>
                      Play
                    </Button>
                  </a>
                ]}
              >
                <Card.Meta
                  title={item.play_name}
                  description={
                    <>
                      <div>{item.play_description}</div>
                      <div style={{ marginTop: 3 }}>
                        <Text type="secondary">Genre: {item.play_genre}</Text>
                      </div>
                    </>
                  }
                />
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
            <Title>Daftar Playlist</Title>
            <Text style={{ fontSize: "12pt" }}>Selamat Datang di Galeri Playlist</Text>
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