import React, { useCallback, useEffect, useState } from 'react';
import { Button, Card, Message, Space, Table, Tag } from '@arco-design/web-react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

interface ArticleItem {
  id: string;
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ArticleList() {
  const history = useHistory();
  const [data, setData] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchList = useCallback(() => {
    setLoading(true);
    axios
      .get('/articles', {
        params: {
          page,
          pageSize,
        },
      })
      .then((res) => {
        const payload = res.data?.data || {};
        setData(payload.data || []);
        setTotal(payload.total || 0);
      })
      .catch(() => {
        Message.error('文章列表加载失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, pageSize]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleEdit = (record: ArticleItem) => {
    history.push(`/articles/editor?id=${record.id}`);
  };

  const handleDelete = (record: ArticleItem) => {
    setLoading(true);
    axios
      .delete(`/articles/${record.id}`)
      .then(() => {
        Message.success('删除成功');
        fetchList();
      })
      .catch(() => {
        Message.error('删除失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space size={6} wrap>
          {tags?.length
            ? tags.map((tag) => <Tag key={tag}>{tag}</Tag>)
            : '暂无'}
        </Space>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: (value: string) => (value ? new Date(value).toLocaleString() : '-'),
    },
    {
      title: '操作',
      render: (_: unknown, record: ArticleItem) => (
        <Space>
          <Button size="mini" type="primary" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="mini" status="danger" onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="文章列表">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => history.push('/articles/editor')}>
          新建文章
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        data={data}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: true,
          onChange: (current, size) => {
            setPage(current);
            setPageSize(size || 10);
          },
        }}
      />
    </Card>
  );
}
