import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from '@arco-design/web-react';
import axios from 'axios';

type TagStatus = 'active' | 'inactive';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  status: TagStatus;
  articleCount?: number | string;
  updatedAt: string;
}

interface TagFormValues {
  name: string;
  slug: string;
  description?: string;
  color: string;
  status?: TagStatus;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const DEFAULT_TAG_COLOR = '#3b82f6';

function getArticleCount(record: TagItem) {
  const count = Number(record.articleCount ?? 0);
  return Number.isNaN(count) ? 0 : count;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message || fallback;
  }

  return fallback;
}

export default function TagManagement() {
  const [data, setData] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [form] = Form.useForm<TagFormValues>();
  const watchedColor = Form.useWatch('color', form) || DEFAULT_TAG_COLOR;

  const fetchList = useCallback(() => {
    setLoading(true);
    axios
      .get('/tags')
      .then((res) => {
        setData(res.data?.data?.tags || []);
      })
      .catch((error) => {
        Message.error(getErrorMessage(error, '标签列表加载失败'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreateModal = () => {
    setEditingTag(null);
    form.resetFields();
    form.setFieldsValue({
      color: DEFAULT_TAG_COLOR,
      status: 'active',
    });
    setModalVisible(true);
  };

  const openEditModal = (record: TagItem) => {
    setEditingTag(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description || '',
      color: record.color || DEFAULT_TAG_COLOR,
      status: record.status,
    });
    setModalVisible(true);
  };

  const submitForm = async () => {
    try {
      const values = await form.validate();
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        color: values.color,
        status: values.status ?? 'active',
      };

      setLoading(true);
      if (editingTag) {
        await axios.put(`/tags/${editingTag.id}`, payload);
        Message.success('更新成功');
      } else {
        await axios.post('/tags', payload);
        Message.success('创建成功');
      }

      setModalVisible(false);
      fetchList();
    } catch (error) {
      Message.error(getErrorMessage(error, '保存失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (record: TagItem) => {
    setLoading(true);
    axios
      .delete(`/tags/${record.id}`)
      .then(() => {
        Message.success('删除成功');
        fetchList();
      })
      .catch((error) => {
        Message.error(getErrorMessage(error, '删除失败'));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleStatusChange = async (record: TagItem, checked: boolean) => {
    const nextStatus: TagStatus = checked ? 'active' : 'inactive';
    try {
      await axios.put(`/tags/${record.id}`, {
        status: nextStatus,
      });
      Message.success('状态已更新');
      fetchList();
    } catch (error) {
      Message.error(getErrorMessage(error, '状态更新失败'));
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (value: string, record: TagItem) => (
        <Space size={8}>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: record.color,
            }}
          />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (value: string | null) => value || '-',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      width: 120,
      render: (value: string) => (
        <Tag color={value} style={{ color: '#fff' }}>
          {value}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (_: unknown, record: TagItem) => (
        <Switch
          size="small"
          checked={record.status === 'active'}
          checkedText="启用"
          uncheckedText="禁用"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: '文章数',
      dataIndex: 'articleCount',
      width: 90,
      render: (_: unknown, record: TagItem) => <Tag>{getArticleCount(record)}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (value: string) => (value ? new Date(value).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 150,
      render: (_: unknown, record: TagItem) => (
        <Space>
          <Button size="mini" type="primary" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="若标签已被文章使用，将无法删除。确认删除？"
            onOk={() => handleDelete(record)}
          >
            <Button size="mini" status="danger">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="标签管理">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          新建标签
        </Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} data={data} pagination={false} />

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitForm}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            field="name"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input maxLength={30} placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item label="Slug" field="slug" rules={[{ required: true, message: '请输入标签 slug' }]}>
            <Input placeholder="lowercase-slug" />
          </Form.Item>
          <Form.Item label="描述" field="description">
            <Input.TextArea placeholder="请输入标签描述" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item
            label="颜色"
            field="color"
            rules={[
              { required: true, message: '请选择标签颜色' },
              {
                match: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
                message: '请输入合法 HEX 色值',
              },
            ]}
          >
            <Input
              type="color"
              style={{ width: 72, height: 36, padding: 2, verticalAlign: 'middle' }}
            />
          </Form.Item>
          <Form.Item field="color" noStyle>
            <Input placeholder="#3b82f6" />
          </Form.Item>
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <Tag color={watchedColor} style={{ color: '#fff' }}>
              颜色预览 {watchedColor}
            </Tag>
          </div>
          <Form.Item label="状态" field="status">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
