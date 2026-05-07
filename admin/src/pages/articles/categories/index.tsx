import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
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

type CategoryStatus = 'active' | 'inactive';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort: number;
  status: CategoryStatus;
  articleCount?: number | string;
  updatedAt: string;
}

interface CategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  sort?: number;
  status?: CategoryStatus;
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

function getArticleCount(record: CategoryItem) {
  const count = Number(record.articleCount ?? 0);
  return Number.isNaN(count) ? 0 : count;
}

export default function CategoryManagement() {
  const [data, setData] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [form] = Form.useForm<CategoryFormValues>();

  const fetchList = useCallback(() => {
    setLoading(true);
    axios
      .get('/categories')
      .then((res) => {
        setData(res.data?.data?.categories || []);
      })
      .catch(() => {
        Message.error('分类列表加载失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      sort: 0,
      status: 'active',
    });
    setModalVisible(true);
  };

  const openEditModal = (record: CategoryItem) => {
    setEditingCategory(record);
    form.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description || '',
      sort: record.sort,
      status: record.status,
    });
    setModalVisible(true);
  };

  const submitForm = async () => {
    const values = await form.validate();
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      sort: values.sort ?? 0,
      status: values.status ?? 'active',
    };

    if (editingCategory) {
      await axios.put(`/categories/${editingCategory.id}`, payload);
      Message.success('更新成功');
    } else {
      await axios.post('/categories', payload);
      Message.success('创建成功');
    }

    setModalVisible(false);
    fetchList();
  };

  const handleDelete = (record: CategoryItem) => {
    setLoading(true);
    axios
      .delete(`/categories/${record.id}`)
      .then(() => {
        Message.success('删除成功，关联文章已转入未分类');
        fetchList();
      })
      .catch(() => {
        Message.error('删除失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleStatusChange = async (record: CategoryItem, checked: boolean) => {
    const nextStatus: CategoryStatus = checked ? 'active' : 'inactive';
    try {
      await axios.put(`/categories/${record.id}`, {
        status: nextStatus,
      });
      Message.success('状态已更新');
      fetchList();
    } catch {
      Message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
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
      title: '排序',
      dataIndex: 'sort',
      width: 90,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (_: unknown, record: CategoryItem) => (
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
      render: (_: unknown, record: CategoryItem) => <Tag>{getArticleCount(record)}</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (value: string) => (value ? new Date(value).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 150,
      render: (_: unknown, record: CategoryItem) => (
        <Space>
          <Button size="mini" type="primary" onClick={() => openEditModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除后关联文章会转入未分类，确认删除？"
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
    <Card title="分类管理">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openCreateModal}>
          新建分类
        </Button>
      </Space>
      <Table rowKey="id" loading={loading} columns={columns} data={data} pagination={false} />

      <Modal
        title={editingCategory ? '编辑分类' : '新建分类'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitForm}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="名称"
            field="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input maxLength={30} placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            label="Slug"
            field="slug"
            rules={[{ required: true, message: '请输入分类 slug' }]}
          >
            <Input placeholder="lowercase-slug" />
          </Form.Item>
          <Form.Item label="描述" field="description">
            <Input.TextArea placeholder="请输入分类描述" autoSize={{ minRows: 3, maxRows: 5 }} />
          </Form.Item>
          <Form.Item label="排序" field="sort">
            <InputNumber min={-9999} max={9999} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" field="status">
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
