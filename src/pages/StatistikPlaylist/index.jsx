import { Col, Row, Typography, Card, Divider, Skeleton, Statistic, notification } from "antd";
import { getDataPrivate } from "../../utils/api";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RiseOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';

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

  // Menghitung variasi konten per genre
  const getGenreVariety = () => {
    const genreVariety = {};
    
    // Tahap 1: Mengumpulkan data dasar
    allPlaylists.forEach(playlist => {
      if (!genreVariety[playlist.play_genre]) {
        genreVariety[playlist.play_genre] = {
          total: 0,
          uniqueNames: new Set(),
          uniqueDescriptions: new Set(),
          uniqueUrls: new Set(),
          descriptionLengths: [], // Untuk menghitung rata-rata panjang deskripsi
          nameLengths: [], // Untuk menghitung rata-rata panjang nama
          keywords: new Set() // Untuk menghitung variasi kata kunci
        };
      }
      
      const genre = genreVariety[playlist.play_genre];
      genre.total++;
      genre.uniqueNames.add(playlist.play_name);
      genre.uniqueDescriptions.add(playlist.play_description);
      genre.uniqueUrls.add(playlist.play_url);
      
      // Menyimpan panjang deskripsi dan nama
      genre.descriptionLengths.push(playlist.play_description.length);
      genre.nameLengths.push(playlist.play_name.length);
      
      // Mengekstrak kata kunci dari deskripsi
      const words = playlist.play_description.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) { // Hanya kata dengan panjang > 3 karakter
          genre.keywords.add(word);
        }
      });
    });

    // Tahap 2: Menghitung skor variasi untuk setiap genre
    const result = Object.entries(genreVariety).map(([genre, data]) => {
      // 1. Keunikan konten (40% bobot)
      const nameVariety = (data.uniqueNames.size / data.total) * 100;
      const descVariety = (data.uniqueDescriptions.size / data.total) * 100;
      const urlVariety = (data.uniqueUrls.size / data.total) * 100;
      
      // 2. Kedalaman konten (30% bobot)
      const avgDescLength = data.descriptionLengths.reduce((a, b) => a + b, 0) / data.total;
      const avgNameLength = data.nameLengths.reduce((a, b) => a + b, 0) / data.total;
      const keywordVariety = (data.keywords.size / data.total) * 100;
      
      // 3. Jumlah konten (30% bobot)
      const contentVolume = Math.min((data.total / 10) * 100, 100); // Maksimal 10 playlist = 100%
      
      // Menghitung skor akhir dengan bobot baru
      const varietyScore = (
        // Keunikan konten (40%)
        (nameVariety * 0.15) +    // 15% bobot nama
        (descVariety * 0.15) +    // 15% bobot deskripsi
        (urlVariety * 0.1) +      // 10% bobot URL
        
        // Kedalaman konten (30%)
        (Math.min(avgDescLength / 100, 1) * 100 * 0.1) +  // 10% bobot panjang deskripsi
        (Math.min(avgNameLength / 50, 1) * 100 * 0.05) +  // 5% bobot panjang nama
        (keywordVariety * 0.15) +  // 15% bobot variasi kata kunci
        
        // Jumlah konten (30%)
        (contentVolume * 0.3)     // 30% bobot jumlah playlist
      );

      // Debug: Log detail perhitungan untuk setiap genre
      console.log(`Detail perhitungan untuk genre ${genre}:`, {
        total: data.total,
        uniqueNames: data.uniqueNames.size,
        uniqueDescriptions: data.uniqueDescriptions.size,
        uniqueUrls: data.uniqueUrls.size,
        avgDescLength,
        avgNameLength,
        keywordCount: data.keywords.size,
        nameVariety,
        descVariety,
        urlVariety,
        keywordVariety,
        contentVolume,
        varietyScore
      });

      return {
        genre,
        varietyScore,
        details: {
          nameVariety,
          descVariety,
          urlVariety,
          keywordVariety,
          contentVolume
        }
      };
    }).sort((a, b) => b.varietyScore - a.varietyScore);

    // Debug: Log hasil akhir
    console.log('Hasil akhir perhitungan:', result);

    return result;
  };

  // Mendapatkan genre dengan variasi paling beragam
  const getMostDiverseGenre = () => {
    const variety = getGenreVariety();
    if (variety.length === 0) return { genre: '-', varietyScore: 0 };
    
    const mostDiverse = variety[0];
    return {
      genre: mostDiverse.genre,
      varietyScore: mostDiverse.varietyScore,
      details: mostDiverse.details
    };
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
                        title="Genre Paling Beragam"
                        value={getMostDiverseGenre().genre}
                        suffix={`(${getMostDiverseGenre().varietyScore.toFixed(1)}%)`}
                        prefix={<AppstoreOutlined />}
                        valueStyle={{ color: '#1890ff' }}
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