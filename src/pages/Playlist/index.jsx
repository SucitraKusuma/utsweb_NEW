import { Col, Row, Typography, Card, List, Divider, Skeleton, FloatButton, Drawer, Form, Input, Button, notification, Popconfirm, Select } from "antd";
import { getDataPrivate, sendDataPrivate, deleteDataPrivateURLEncoded } from "../../utils/api";
import { useState, useEffect } from "react";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, YoutubeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Playlist = () => {
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [idSelected, setIdSelected] = useState(null);

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
          setDataSources(resp.datas);
        } else {
          openNotificationWithIcon("error", "Error", resp?.message || "Gagal mengambil data playlist");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const handleSearch = (value) => {
    setSearchText(value.toLowerCase());
  };
  
  let dataSourcesFiltered = dataSources.filter((item) => {
    return item?.play_name?.toLowerCase().includes(searchText);
  });

  const openDrawer = () => {
    form.resetFields();
    setIsEdit(false);
    setIdSelected(null);
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
    setIdSelected(record.id_play);
    form.setFieldsValue({
      play_name: record.play_name,
      play_url: record.play_url,
      play_thumbnail: record.play_thumbnail,
      play_description: record.play_description,
      play_genre: record.play_genre
    });
  };

  const handleSubmit = () => {
    let url = isEdit ? `/api/playlist/update/${idSelected}`: "/api/playlist/49";
    let msg = isEdit ? "Sukses memperbarui playlist" : "Sukses menambahkan playlist";

    let playName = form.getFieldValue("play_name");
    let playUrl = form.getFieldValue("play_url");
    let playThumbnail = form.getFieldValue("play_thumbnail");
    let playDescription = form.getFieldValue("play_description");
    let playGenre = form.getFieldValue("play_genre");

    let formData = new FormData();
    formData.append("play_name", playName);
    formData.append("play_url", playUrl);
    formData.append("play_thumbnail", playThumbnail);
    formData.append("play_description", playDescription);
    formData.append("play_genre", playGenre);

    sendDataPrivate(url, formData)
      .then((resp) => {
        if (resp?.datas) {
          openNotificationWithIcon(
            "success", msg
          );
          setIsOpenDrawer(false);
          getDataPlaylist();
          form.resetFields();
          onClose();
        } else {
          openNotificationWithIcon(
            "error", 
            "Data playlist", 
            "Data gagal dikirim"
          );
        }
      })
    };

  const renderDrawer = () => (
    <Drawer
      title={isEdit ? "Edit Playlist" : "Tambah Playlist"}
      closable={{ 'aria-label': 'Close Button' }}
      onClose={onClose}
      open={isOpenDrawer}
      extra={<Button type="primary" onClick={handleSubmit}>Submit</Button>}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="Judul Playlist" 
          name="play_name"
          rules={[{ required: true, message: 'Judul playlist harus diisi' }]}
        >
          <Input placeholder="eg. My Video" />
        </Form.Item>
        
        <Form.Item 
          label="URL Video YouTube" 
          name="play_url"
          rules={[{ required: true, message: 'URL video harus diisi' }]}
        >
          <Input prefix={<YoutubeOutlined />} placeholder="eg. https://youtube.com/..." />
        </Form.Item>
        
        <Form.Item 
          label="Thumbnail URL" 
          name="play_thumbnail"
          rules={[{ required: true, message: 'Thumbnail harus diisi' }]}
        >
          <Input placeholder="eg. https://img.youtube.com/..." />
        </Form.Item>
        
        <Form.Item 
          label="Genre" 
          name="play_genre"
          initialValue="music"
          rules={[{ required: true, message: 'Genre harus diisi' }]}
        >
          <Select
            placeholder="Pilih genre"
            options={genreOptions}
          />
        </Form.Item>
        
        <Form.Item 
          label="Deskripsi" 
          name="play_description"
        >
          <Input.TextArea rows={3} placeholder="Deskripsi playlist (opsional)" />
        </Form.Item>
      </Form>
    </Drawer>
  );

  const confirmDelete = (record) => {
    let url = `/api/playlist/${record?.id_play}`;
    let params = new URLSearchParams();
    params.append("id_play", record?.id_play);  

   
    deleteDataPrivateURLEncoded(url, params)
      .then((resp) => {
        if (resp?.status === 200) {
          openNotificationWithIcon("success", "Data terhapus", "Berhasil menghapus playlist");
          getDataPlaylist();
        } else {
          openNotificationWithIcon("error", "Gagal hapus", resp?.message || "Data tidak dapat dihapus");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="layout-content">
      {contextHolder}
      <FloatButton 
        icon={<PlusCircleOutlined/>} 
        type="primary" 
        style={{ insetInlineEnd: 24 }} 
        onClick={openDrawer}
      />
      {renderDrawer()}

      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <Title>Daftar Playlist</Title>
            <Text style={{ fontSize: "12pt" }}>Selamat Datang di Manajemen Playlist</Text>
            <Divider />
            
            <Input
              prefix={<SearchOutlined />}
              placeholder="Cari playlist..."
              allowClear
              size='large'
              onChange={(e) => handleSearch(e.target.value)}
              style={{ marginBottom: 24 }}
            />

            {isLoading && dataSources.length <= 0 ? (
              <Skeleton active />
            ) : (
              <List
                grid={{ 
                  gutter: 24,
                  xl: 3,
                  lg: 3,
                  md: 2,
                  sm: 1,
                  xs: 1
                }}
                dataSource={dataSourcesFiltered ?? []}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <img 
                            alt={item.play_name} 
                            src={item.play_thumbnail} 
                            style={{ 
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                      }
                      actions={[
                        <Button 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleDrawerEdit(item)}
                          key="edit"
                          style={{ 
                            minWidth: 70,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 500,
                            margin: '0 4px'
                          }}
                        >
                          Edit
                        </Button>,
                        <a 
                          href={item.play_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          key="play"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Button 
                            type="text" 
                            icon={<PlayCircleOutlined />}
                            style={{
                              minWidth: 70,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 500,
                              margin: '0 4px'
                            }}
                          >
                            Play
                          </Button>
                        </a>,
                        <Popconfirm
                          key="delete"
                          title="Delete the task"
                          description="Are you sure to delete this task?"
                          onConfirm={() => confirmDelete(item)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            style={{ 
                              minWidth: 70,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 500,
                              marginLeft: '0px',
                              marginRight: '-5px'
                            }}
                          >
                            Delete
                          </Button>
                        </Popconfirm>
                      ]}
                      style={{ 
                        marginBottom: '16px',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      bodyStyle={{ flex: 1 }}
                      actionsStyle={{ padding: '8px 32px' }}
                    >
                      <Card.Meta
                        title={item.play_name}
                        description={
                          <>
                            <div style={{ 
                              marginBottom: '8px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {item.play_description}
                            </div>
                            <div>
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
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Playlist; 