import React, { useState, useEffect } from 'react';
import '@radix-ui/themes/styles.css';
import { Button, Table, TextField, Theme } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import axios from 'axios';

const BackendUrl = 'http://127.0.0.1:8080'; // 你的后端地址

interface Result {
  title: string;
  date: string;
  size: number;
  hash: string; // 添加 hash 字段
}

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const formatSize = (bytes: number) => {
    const gigabytes = bytes / (1024 ** 3);
    return gigabytes.toFixed(2) + ' GB';
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BackendUrl}/search`, {
        title: searchTerm,
        page: currentPage,
        pageSize: 10,
      });
      setResults(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults([]); // 设置为空数组，以防止在渲染时产生错误
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    handleSearch();
  }, [currentPage]); // 当 currentPage 变化时触发搜索

  return (
    <html>
      <body>
        <Theme>
          <TextField.Root>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              placeholder="Search the docs…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </TextField.Root>
          <Button onClick={handleSearch}>
            <MagnifyingGlassIcon width="16" height="16" /> Search
          </Button>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Magnet link</Table.ColumnHeaderCell> {/* 添加 hash 列头 */}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {loading ? (
                <tr>
                  <td colSpan={4}>Loading...</td>
                </tr>
              ) : results !== null && results.length > 0 ? (
                results.map((result, index) => (
                  <Table.Row key={index}>
                    <Table.RowHeaderCell>{result.title}</Table.RowHeaderCell>
                    <Table.Cell>{result.date}</Table.Cell>
                    <Table.Cell>{formatSize(result.size)}</Table.Cell>
                    <Table.Cell>{`magnet:?xt=urn:btih:${result.hash}`}</Table.Cell> {/* 添加磁力链接开头 */}
                  </Table.Row>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Not found</td>
                </tr>
              )}
            </Table.Body>
          </Table.Root>

          {/* 翻页控件 */}
          <div>
            <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous Page
            </Button>
            <span> Current Page: {currentPage} </span>
            <Button onClick={() => handlePageChange(currentPage + 1)} disabled={!results || results.length < 10}>
              Next Page
            </Button>
          </div>

        </Theme>
      </body>
    </html>
  );
};

export default SearchPage;
