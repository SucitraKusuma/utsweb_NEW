// Import komponen dan hook yang dibutuhkan dari Ant Design, React, Recharts, dan React Router DOM.
// Ini adalah modul-modul yang menyediakan fungsionalitas UI, manajemen state, visualisasi data, dan navigasi.
import { Col, Row, Typography, Card, Divider, Skeleton, Statistic, notification } from "antd";
import { getDataPrivate } from "../../utils/api";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RiseOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Destrukturisasi komponen Typography untuk akses yang lebih mudah.
const { Title, Text } = Typography;

// Komponen utama untuk halaman Statistik Playlist.
const PlaylistStats = () => {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

  // Definisi warna yang akan digunakan dalam grafik.
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Fungsi untuk menampilkan notifikasi kepada pengguna.
  const openNotificationWithIcon = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
    });
  };

  // Efek samping (side effect) yang berjalan setelah render pertama komponen.
  // Bertanggung jawab untuk mengambil data playlist saat komponen dimuat.
  useEffect(() => {
    getDataPlaylist();
  }, []); // Array dependensi kosong memastikan efek ini hanya berjalan sekali (seperti componentDidMount).

  // Fungsi untuk mengambil data playlist dari API backend.
  // Menangani status loading dan menampilkan notifikasi jika ada kesalahan.
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

  // Fungsi untuk menghitung statistik jumlah playlist per genre.
  // Mengembalikan data dalam format yang cocok untuk grafik.
  const getGenreStats = () => {
    const genreCount = {};
    allPlaylists.forEach(playlist => {
      genreCount[playlist.play_genre] = (genreCount[playlist.play_genre] || 0) + 1;
    });
    return Object.entries(genreCount).map(([name, value]) => ({ name, value }));
  };

  // Fungsi untuk mendapatkan total jumlah semua playlist.
  const getTotalPlaylists = () => {
    return allPlaylists.length;
  };

  // Fungsi ini mirip dengan getGenreStats, menghitung jumlah playlist per genre.
  // Bisa jadi ada redundansi atau perbedaan penggunaan yang spesifik.
  const getPlaylistsPerGenre = () => {
    const genreCount = {};
    allPlaylists.forEach(playlist => {
      genreCount[playlist.play_genre] = (genreCount[playlist.play_genre] || 0) + 1;
    });
    return Object.entries(genreCount).map(([genre, count]) => ({ genre, count }));
  };

  // Fungsi untuk menentukan genre yang paling populer berdasarkan jumlah playlist.
  const getMostPopularGenre = () => {
    const genreStats = getGenreStats();
    return genreStats.reduce((prev, current) =>
      (prev.value > current.value) ? prev : current
    ).name;
  };

  // Fungsi kompleks untuk menghitung skor variasi konten untuk setiap genre.
  // Ini melibatkan perhitungan keunikan nama, deskripsi, URL, variasi kata kunci, dan volume konten.
  const getGenreVariety = () => {
    const genreVariety = {};

    // Tahap 1: Mengumpulkan data dasar (nama unik, deskripsi, URL, panjang, kata kunci) per genre.
    allPlaylists.forEach(playlist => {
      if (!genreVariety[playlist.play_genre]) {
        genreVariety[playlist.play_genre] = {
          total: 0,
          uniqueNames: new Set(),
          uniqueDescriptions: new Set(),
          uniqueUrls: new Set(),
          descriptionLengths: [],
          nameLengths: [],
          keywords: new Set()
        };
      }

      const genre = genreVariety[playlist.play_genre];
      genre.total++;
      genre.uniqueNames.add(playlist.play_name);
      genre.uniqueDescriptions.add(playlist.play_description);
      genre.uniqueUrls.add(playlist.play_url);

      genre.descriptionLengths.push(playlist.play_description.length);
      genre.nameLengths.push(playlist.play_name.length);

      const words = playlist.play_description.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) {
          genre.keywords.add(word);
        }
      });
    });

    // Tahap 2: Menghitung skor variasi akhir untuk setiap genre dengan pembobotan tertentu.
    const result = Object.entries(genreVariety).map(([genre, data]) => {
      // Perhitungan Keunikan Konten
      const nameVariety = (data.uniqueNames.size / data.total) * 100;
      const descVariety = (data.uniqueDescriptions.size / data.total) * 100;
      const urlVariety = (data.uniqueUrls.size / data.total) * 100;

      // Perhitungan Kedalaman Konten
      const avgDescLength = data.descriptionLengths.reduce((a, b) => a + b, 0) / data.total;
      const avgNameLength = data.nameLengths.reduce((a, b) => a + b, 0) / data.total;
      const keywordVariety = (data.keywords.size / data.total) * 100;

      // Perhitungan Jumlah Konten
      const contentVolume = Math.min((data.total / 10) * 100, 100);

      // Perhitungan Skor Variasi Total dengan Bobot
      const varietyScore = (
        (nameVariety * 0.15) +
        (descVariety * 0.15) +
        (urlVariety * 0.1) +
        (Math.min(avgDescLength / 100, 1) * 100 * 0.1) +
        (Math.min(avgNameLength / 50, 1) * 100 * 0.05) +
        (keywordVariety * 0.15) +
        (contentVolume * 0.3)
      );

      // Log detail perhitungan untuk debugging (bisa dihapus di produksi).
      console.log( `Detail perhitungan untuk genre ${genre}:`, {
        total: data.total, uniqueNames: data.uniqueNames.size, uniqueDescriptions: data.uniqueDescriptions.size,
        uniqueUrls: data.uniqueUrls.size, avgDescLength, avgNameLength, keywordCount: data.keywords.size,
        nameVariety, descVariety, urlVariety, keywordVariety, contentVolume, varietyScore
      });

      // Mengembalikan objek genre dengan skor variasi dan detailnya.
      return {
        genre,
        varietyScore,
        details: { nameVariety, descVariety, urlVariety, keywordVariety, contentVolume }
      };
    }).sort((a, b) => b.varietyScore - a.varietyScore); // Urutkan hasil berdasarkan skor variasi secara menurun.

    // Log hasil akhir perhitungan (bisa dihapus di produksi).
    console.log('Hasil akhir perhitungan:', result);

    return result;
  };

  // Fungsi untuk mendapatkan genre dengan skor variasi paling beragam.
  // Jika tidak ada data, mengembalikan nilai default.
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

  // Bagian render komponen (tampilan UI) dari halaman Statistik Playlist.
  return (
    <div className="layout-content">
      {contextHolder}
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card bordered={false} className="circlebox h-full w-full">
            <Title>Statistik Playlist</Title>
            <Text style={{ fontSize: "12pt" }}>Lihat statistik genre dan playlist kamu dalam satu halaman yang ringkas</Text>
            <Divider />

            {/* Menampilkan Skeleton loading jika data belum siap, atau konten jika sudah siap. */}
            {isLoading ? (
              <Skeleton active />
            ) : (
              <>
                {/* Bagian Statistik Umum: Menampilkan tiga kartu statistik utama. */}
                <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                  {/* Kartu Total Playlist */}
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card
                      // Ketika diklik, navigasi ke halaman '/playlist-view' (Galeri Playlist) tanpa filter.
                      onClick={() => navigate('/playlist-view')}
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s ease-in-out' }}
                      // Efek visual hover dan klik untuk user experience yang lebih baik.
                      onMouseDown={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                      onMouseUp={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Statistic
                        title="Total Playlist"
                        value={getTotalPlaylists()}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Card>
                  </Col>
                  {/* Kartu Genre Paling Populer */}
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card
                      // Ketika diklik, navigasi ke '/playlist-view' dan kirim genre paling populer sebagai state.
                      onClick={() => navigate('/playlist-view', { state: { genre: getMostPopularGenre() } })}
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s ease-in-out' }}
                      // Efek visual hover dan klik.
                      onMouseDown={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                      onMouseUp={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Statistic
                        title="Genre Paling Populer"
                        value={getMostPopularGenre()}
                        prefix={<RiseOutlined />}
                        valueStyle={{ color: '#722ed1' }}
                      />
                    </Card>
                  </Col>
                  {/* Kartu Genre Paling Beragam */}
                  <Col xs={24} sm={12} md={8} lg={8}>
                    <Card
                      // Ketika diklik, navigasi ke '/playlist-view' dan kirim genre paling beragam sebagai state.
                      onClick={() => navigate('/playlist-view', { state: { genre: getMostDiverseGenre().genre } })}
                      style={{ cursor: 'pointer', transition: 'background-color 0.2s ease-in-out' }}
                      // Efek visual hover dan klik.
                      onMouseDown={e => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                      onMouseUp={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f2f5'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
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

                {/* Bagian Grafik: Menampilkan distribusi genre dan jumlah playlist per genre. */}
                <Row gutter={[24, 24]}>
                  {/* Grafik Distribusi Genre (Pie Chart) */}
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
                              label={({ name, percent }) =>  `${name} (${(percent * 100).toFixed(0)}%)`}
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

                  {/* Grafik Jumlah Playlist per Genre (Bar Chart) */}
                  <Col xs={24} md={12}>
                    <Card title="Jumlah Playlist per Genre">
                      <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={getPlaylistsPerGenre()}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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