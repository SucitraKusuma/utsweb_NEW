import { Col, Row, Typography, Card, List, Divider, Skeleton , FloatButton, Drawer, Form, Input, Button, notification, Popconfirm } from "antd";
import { getData, sendData, deleteData} from "../../utils/api";
import { useState, useEffect } from "react";
import { PlusCircleOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Gallery = () => {
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [searchText, setSearchText] = useState(""); //buat state untuk search
  //buat state untuk menandai satus tutup/buka drawer
  const [isOpenDrawer, setIsOpenDrawer] = useState(false);
  const [form] = Form.useForm(); //buat form untuk drawer
  const [api, contextHolder] = notification.useNotification();
  const [isEdit, setIsEdit] = useState(false);
  const [idSelected, setIdSelected] = useState(null);
  const openNotificationWithIcon = (type, title, description) => {
    api[type]({
      message: title,
      description: description,
    });
  };

  useEffect(() => {
    getDataGallery();
  }, []);

  const getDataGallery = () => {
    getData("/api/v1/natures")
      .then((resp) => {
        if (resp) {
          setDataSources(resp);
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
    return item?.name_natures.toLowerCase().includes(searchText);
  });

  const openDrawer = () => {
    setIsOpenDrawer(true); 
  }

  const onClose = () => {
    if (isEdit) {
      form.resetFields(); //reset form jika edit
      setIsEdit(false); //set isEdit ke false
      setIdSelected(null); //set idSelected ke null
    }
    setIsOpenDrawer(false); 
  }

  const handleDrawerEdit = (record) => {
    //buka drawer dan set data yang dipilih
    setIsOpenDrawer(true); 

    //set data yang dipilih
    setIsEdit(true); 
    setIdSelected(record.id);
    form.setFieldsValue({
      name_natures: record.name_natures,
      description_natures: record.description,
    });
  };

  const handleSubmit = () => {
    //buat aksi kirim data disini
    let url = isEdit ? `/api/v1/natures/${idSelected}` : "/api/v1/natures"; 
    let msg = isEdit ? "Sukses memperbarui data" : "Sukses menambahkan data";

    let nameNatures = form.getFieldValue("name_natures"); //ambil data dari form
    let descriptionNatures = form.getFieldValue("description_natures"); //ambil data dari form

    let formData = new FormData(); //buat form data untuk kirim data ke server
    formData.append("name_natures", nameNatures); //isi form data dengan data dari form
    formData.append("description", descriptionNatures); //isi form data dengan data dari form

    sendData(url, formData) //kirim data ke server
    .then((resp) => {
      if (resp ?.datas) {
        openNotificationWithIcon(
          "success", msg,
        );
        setIsOpenDrawer(false); //tutup drawer 
        getDataGallery(); 
        onClose(); //reset form
    } else {
       openNotificationWithIcon(
        "error", 
        "Data natures", 
        "Data gagal dikirim"
      ); 
    }
    })
  };

  const renderDrawer = () => {
    return(
    <Drawer
      title="Form Natures"
      closable={{ 'aria-label': 'Close Button' }}
      onClose={onClose}
      open={isOpenDrawer}
      extra={<Button type="primary" onClick={() => handleSubmit()}>Submit </Button>}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
        label = "Name of natures" 
        name="name_natures"
        rules={[{ required: true, message: 'Must filled' }]}
        >
          <Input placeholder="eg. Mountain" />
        </Form.Item>
        <Form.Item 
        label = "Description of natures" 
        name="description_natures"
        rules={[{ required: true, message: 'Must filled' }]}
        >
          <Input.TextArea rows={3} placeholder="eg. Description of natures" />
        </Form.Item>
        </Form>
    </Drawer>
    )
  }

  const confirmDelete = (record) => {
    let url = `/api/v1/natures/${record?.id}`;
    let params = new URLSearchParams();
    params.append("id", record?.id);

    deleteData(url, params)
      .then((resp) => {
        if (resp?.status == 200) {
          openNotificationWithIcon("success", "Data terhapus", "berhasil menghapus data");
          getDataGallery();
        } else {
          openNotificationWithIcon("error", "Data gagal terhapus", "data tidak dapat dihapus");
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
      onClick={() => openDrawer()}
       />
      {renderDrawer()}

      <Row gutter={[24, 0]}>
        <Col xs={23} className="mb-24">
          <Card bordered={false} className="circlebox h-full w-full">
            <Title> List of Natures </Title>
            <Text style={{ fontSize: "12pt" }}>Selamat Datang </Text>
            <Divider />
            
            <Input
             prefix={<SearchOutlined />}
             placeholder="input search text"
             allowClear
             size='large'
             onChange={(e) => handleSearch(e.target.value)}
            />

            {isLoading && dataSources.length <= 0 ? (
              <Skeleton active />
            ) : (
            
              <List
                grid={{ gutter: 16, xl: 4, lg: 3, md: 2, sm: 1, xs: 1 }}
                dataSource={dataSourcesFiltered?? []}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      cover={<img alt="example" src={item?.url_photo} />}
                      actions={[
                        <EditOutlined key={item.id} onClick={() => handleDrawerEdit(item)} />,
                        <SearchOutlined key={item.id} />,
                      
                      
                      <Popconfirm
                        key={item?.id}
                        title="Delete the task"
                        description="Are you sure to delete this task?"
                        onConfirm={() => confirmDelete(item)}
                        okText="Yes"
                        cancelText="No"
                       >
                         <DeleteOutlined key={item?.id} />
                      </Popconfirm>,
                      ]}
                    >
                      <Card.Meta
                        title={item?.name_natures}
                        description={item?.description}
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

export default Gallery;