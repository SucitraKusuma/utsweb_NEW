import { Col, Row, Typography, Card, Divider, Skeleton, Statistic, notification } from "antd";
import { getDataPrivate } from "../../utils/api";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RiseOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PlaylistStats = () => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

  // Menghitung statistik genre
  const getGenreStats = () => {
    const genreCount = {};
    allPlaylists.forEach(playlist => {
      genreCount[playlist.play_genre] = (genreCount[playlist.play_genre] || 0) + 1;
    });
    return Object.entries(genreCount).map(([name, value]) => ({ name, value }));
  };

  // Menghitung total playlist
  const getTotalPlaylists = () => {
    return allPlaylists.length;
  };

  // Menghitung playlist per genre
  const getPlaylistsPerGenre = () => {
    const genreCount = {};
    allPlaylists.forEach(playlist => {
      genreCount[playlist.play_genre] = (genreCount[playlist.play_genre] || 0) + 1;
    });
    return Object.entries(genreCount).map(([genre, count]) => ({ genre, count }));
  };

  // Menghitung genre paling populer
  const getMostPopularGenre = () => {
    const genreStats = getGenreStats();
    return genreStats.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    ).name;
  };

  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card bordered={false} className="circlebox h-full w-full">
            <Title>Statistik Playlist</Title>
            <Text style={{ fontSize: "12pt" }}>Lihat statistik genre dan playlist kamu dalam satu halaman yang ringkas</Text>
            <Divider />

            {isLoading ? (
              <Skeleton active />
            ) : (
              <>
                {/* Statistik Umum */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card>
                      <Statistic
                        title="Total Playlist"
                        value={getTotalPlaylists()}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card>
                      <Statistic
                        title="Genre Paling Populer"
                        value={getMostPopularGenre()}
                        prefix={<RiseOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card>
                      <Statistic
                        title="Total Genre"
                        value={Object.keys(getGenreStats()).length}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Card>
                  </Col>
                </Row>

                {/* Grafik Genre Distribution */}
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card title="Distribusi Genre">
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={getGenreStats()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getGenreStats().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Col>

                  {/* Grafik Playlist per Genre */}
                  <Col xs={24} md={12}>
                    <Card title="Jumlah Playlist per Genre">
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={getPlaylistsPerGenre()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="genre" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PlaylistStats; 