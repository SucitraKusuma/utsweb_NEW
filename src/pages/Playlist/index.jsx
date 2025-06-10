 import { Col, Row, Typography, Card, List, Divider, Skeleton, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm, Space, message } from "antd";
import { getDataPrivate, sendDataPrivate, deleteDataPrivateURLEncoded, editDataPrivateURLEncoded } from "../../utils/api";
import { useState, useEffect } from "react";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, YoutubeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Playlist = () => {
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [idSelected, setIdSelected] = useState(null);

  const openNotificationWithIcon = (type, title, description) => {
    api[type]({ message: title, description });
  };

  useEffect(() => {
    getDataPlaylist();
  }, []);

  const getDataPlaylist = () => {
    setIsLoading(true);
    getDataPrivate("/api/playlist/49")
      .then((resp) => {
        if (resp?.datas) {
          setDataSources(resp.datas);
        } else {
          openNotificationWithIcon("error", "Error", resp?.message || "Gagal mengambil data playlist");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("Fetch playlist error:", err);
        openNotificationWithIcon("error", "Fetch Error", "Failed to fetch playlist data");
      });
  };

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };

  let dataSourcesFiltered = dataSources.filter((item) => {
    return item?.play_name?.toLowerCase().includes(searchText);
  });

  const openDrawer = () => {
    setIsOpenDrawer(true);
  };

  const onClose = () => {
    if (isEdit) {
      form.resetFields();
      setIsEdit(false);
      setIdSelected(null);
    }
    setIsOpenDrawer(false);
  };

  const handleDrawerEdit = (record) => {
    setIsOpenDrawer(true);
    setIsEdit(true);
    setIdSelected(record.id);
    form.setFieldsValue({
      play_name: record.play_name,
      play_url: record.play_url,
      play_thumbnail: record.play_thumbnail,
      play_description: record.play_description,
    });
  };

  const validateYouTubeUrl = (url) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return pattern.test(url);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setIsSubmitting(true);
      let msg = isEdit ? "Sukses memperbarui playlist" : "Sukses menambahkan playlist";
      
      if (!validateYouTubeUrl(values.play_url)) {
        message.error("URL video harus berupa link YouTube yang valid");
        setIsSubmitting(false);
        return;
      }

      const playlistData = {
        play_name: values.name,
        play_url: values.play_url,
        play_thumbnail: values.play_thumbnail,
        play_description: values.play_description,
      };

      if (isEdit && idSelected) {
        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append("id", idSelected);
        for (const key in playlistData) {
          if (key !== 'id') {
            urlSearchParams.append(key, playlistData[key]);
          }
        }
        
        editDataPrivateURLEncoded("/api/playlist/49", urlSearchParams)
          .then((resp) => {
            if (resp?.datas || resp?.status === 200 || resp?.status === 204) {
              openNotificationWithIcon("success", msg);
              setIsOpenDrawer(false);
              getDataPlaylist();
              onClose();
            } else {
              console.log("API Response (Edit failed):", resp);
              openNotificationWithIcon("error", "Data playlist", resp?.message || "Data gagal diperbarui");
            }
          })
          .catch((error) => {
            console.error("Edit playlist error:", error);
            openNotificationWithIcon("error", "Error", "Terjadi kesalahan saat memperbarui data");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        const formData = new FormData();
        for (const key in playlistData) {
          formData.append(key, playlistData[key]);
        }

        sendDataPrivate("/api/playlist/49", formData)
          .then((resp) => {
            if (resp?.datas || (resp?.status >= 200 && resp?.status <= 299)) {
              openNotificationWithIcon("success", msg);
              setIsOpenDrawer(false);
              getDataPlaylist();
              onClose();
            } else {
              console.log("API Response (Add failed):", resp);
              openNotificationWithIcon("error", "Data playlist", resp?.message || "Data gagal dikirim");
            }
          })
          .catch((error) => {
            console.error("Add playlist error:", error);
            openNotificationWithIcon("error", "Error", "Terjadi kesalahan saat menyimpan data");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    });
  };

  const confirmDelete = (record) => {
    let url = "/api/playlist/49";
    let params = new URLSearchParams();
    params.append("id", record?.id);
    
    deleteDataPrivateURLEncoded(url, params)
      .then((resp) => {
        if (resp?.status === 200) {
          openNotificationWithIcon("success", "Data terhapus", "Berhasil menghapus playlist");
          getDataPlaylist();
        } else {
          openNotificationWithIcon("error", "Gagal hapus", resp?.message || "Playlist tidak dapat dihapus");
        }
      })
      .catch((error) => {
        console.error("Delete playlist error:", error);
        openNotificationWithIcon("error", "Gagal hapus", "Terjadi error saat hapus");
      });
  };

  const renderDrawer = () => (
    <Drawer
      title={isEdit ? "Edit Playlist" : "Tambah Playlist"}
      closable={{ 'aria-label': 'Close Button' }}
      onClose={onClose}
      open={isOpenDrawer}
      width={500}
      extra={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit} loading={isSubmitting}>
            {isEdit ? "Update" : "Submit"}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item 
          label="Judul Playlist" 
          name="play_name" 
          rules={[
            { required: true, message: 'Judul playlist harus diisi' },
            { min: 3, message: 'Judul minimal 3 karakter' }
          ]}
        >
          <Input placeholder="eg. My Video" />
        </Form.Item>
        
        <Form.Item 
          label="URL Video YouTube" 
          name="play_url" 
          rules={[
            { required: true, message: 'URL video harus diisi' },
            { 
              validator: (_, value) => 
                !value || validateYouTubeUrl(value) 
                  ? Promise.resolve() 
                  : Promise.reject(new Error('URL harus berupa link YouTube yang valid'))
            }
          ]}
        >
          <Input 
            prefix={<YoutubeOutlined />} 
            placeholder="eg. https://youtube.com/..." 
          />
        </Form.Item>
        
        <Form.Item 
          label="Thumbnail URL" 
          name="play_thumbnail" 
          rules={[
            { required: true, message: 'Thumbnail harus diisi' },
            { type: 'url', message: 'URL thumbnail tidak valid' }
          ]}
        >
          <Input placeholder="eg. https://img.youtube.com/..." />
        </Form.Item>
        
        <Form.Item 
          label="Deskripsi" 
          name="play_description"
          rules={[
            { max: 500, message: 'Deskripsi maksimal 500 karakter' }
          ]}
        >
          <Input.TextArea 
            rows={4} 
            placeholder="Deskripsi playlist (opsional)" 
            showCount 
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );

  return (
    <div className="layout-content">
      {contextHolder}
      <FloatButton 
        icon={<PlusCircleOutlined />} 
        type="primary" 
        style={{ insetInlineEnd: 24 }} 
        onClick={openDrawer}
        tooltip="Tambah Playlist"
      />
      {renderDrawer()}
      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <div style={{ marginBottom: 24 }}>
              <Title level={2}>My Fun Playlist</Title>
              <Text style={{ fontSize: "14pt", color: "#8c8c8c" }}>
                Daftar semua playlist video favoritmu!
              </Text>
            </div>
            <Divider />
            <Input
              prefix={<SearchOutlined />}
              placeholder="Cari judul playlist..."
              allowClear
              size="large"
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: 24 }}
            />
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : dataSourcesFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">Tidak ada playlist yang ditemukan</Text>
              </div>
            ) : (
              <List
                grid={{ gutter: 16, xl: 4, lg: 3, md: 2, sm: 1, xs: 1 }}
                dataSource={dataSourcesFiltered}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={
                        <a href={item?.play_url} target="_blank" rel="noopener noreferrer">
                          <img 
                            alt={item?.play_name} 
                            src={item?.play_thumbnail} 
                            style={{ 
                              height: 180,
                              objectFit: 'cover',
                              width: '100%'
                            }} 
                          />
                        </a>
                      }
                      actions={[
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleDrawerEdit(item)}
                          key="edit"
                        >
                          Edit
                        </Button>,
                        <a 
                          href={item?.play_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          key="play"
                        >
                          <Button type="text" icon={<PlayCircleOutlined />}>
                            Play
                          </Button>
                        </a>,
                        <Popconfirm
                          key="delete"
                          title="Hapus Playlist"
                          description="Yakin ingin menghapus playlist ini?"
                          onConfirm={() => confirmDelete(item)}
                          okText="Ya"
                          cancelText="Tidak"
                        >
                          <Button type="text" danger icon={<DeleteOutlined />}>
                            Hapus
                          </Button>
                        </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={
                          <a 
                            href={item?.play_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '16px' }}
                          >
                            {item?.play_name}
                          </a>
                        }
                        description={
                          <Text type="secondary" ellipsis={{ rows: 2 }}>
                            {item?.play_description || 'Tidak ada deskripsi'}
                          </Text>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Playlist;
