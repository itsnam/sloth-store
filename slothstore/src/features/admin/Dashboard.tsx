import React from 'react';
import { Product } from '../../types/product';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Doughnut, PolarArea, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const getProductInventoryBarData = (product: Product) => {
    const labels = product.inventory.map(
      (item) => `${item.size}-${item.color}`
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Kho',
          data: product.inventory.map((item) => item.stock),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Đã bán',
          data: product.inventory.map((item) => item.sold), 
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ],
    };
  };

  const getProductInventoryPieData = (product: Product) => {
    return {
      labels: ['Tổng Kho', 'Tổng Đã Bán'],
      datasets: [
        {
          data: [
            product.inventory.reduce((sum, item) => sum + item.stock, 0),
            product.inventory.reduce((sum, item) => sum + item.sold, 0)
          ],
          backgroundColor: [
            'rgba(53, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)'
          ],
          borderColor: [
            'rgba(53, 162, 235, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getAllProductsPieData = () => {
    const totalStock = products.reduce((sum, product) => 
      sum + product.inventory.reduce((pSum, item) => pSum + item.stock, 0), 0
    );
    const totalSold = products.reduce((sum, product) => 
      sum + product.inventory.reduce((pSum, item) => pSum + item.sold, 0), 0
    );

    return {
      labels: ['Tổng Kho của tất cả sản phẩm', 'Tổng Đã bán của tất cả sản phẩm'],
      datasets: [
        {
          data: [totalStock, totalSold],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getAllProductsDetailedData = () => {
    const productTotals = products.map(product => {
      const totalStock = product.inventory.reduce((sum, item) => sum + item.stock, 0);
      const totalSold = product.inventory.reduce((sum, item) => sum + item.sold, 0);
      return {
        name: product.name,
        stock: totalStock,
        sold: totalSold
      };
    });

    return {
      labels: productTotals.map(p => p.name),
      datasets: [
        {
          label: 'Tổng Kho',
          data: productTotals.map(p => p.stock),
          backgroundColor: productTotals.map((_, idx) => 
            `hsla(${idx * (360 / productTotals.length)}, 70%, 50%, 0.5)`
          ),
          borderColor: productTotals.map((_, idx) => 
            `hsla(${idx * (360 / productTotals.length)}, 70%, 50%, 1)`
          ),
          borderWidth: 1,
        },
        {
          label: 'Tổng đã bán',
          data: productTotals.map(p => p.sold),
          backgroundColor: productTotals.map((_, idx) => 
            `hsla(${idx * (360 / productTotals.length)}, 70%, 70%, 0.5)`
          ),
          borderColor: productTotals.map((_, idx) => 
            `hsla(${idx * (360 / productTotals.length)}, 70%, 70%, 1)`
          ),
          borderWidth: 1,
        }
      ],
    };
  };

  const getLineChartData = () => {
    const productTotals = products.map(product => {
      const totalStock = product.inventory.reduce((sum, item) => sum + item.stock, 0);
      const totalSold = product.inventory.reduce((sum, item) => sum + item.sold, 0);
      return {
        name: product.name,
        stock: totalStock,
        sold: totalSold
      };
    });

    return {
      labels: productTotals.map(p => p.name),
      datasets: [
        {
          label: 'Mức Kho',
          data: productTotals.map(p => p.stock),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.1
        },
        {
          label: 'Đã bán',
          data: productTotals.map(p => p.sold),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.1
        }
      ]
    };
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    cutout: '50%'
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Biểu đồ tổng</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        margin: '2rem auto',
      }}>
        <div style={{ padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <h3 style={{ textAlign: 'center' }}>Tổng Kho và Đã Bán</h3>
          <Pie options={pieOptions} data={getAllProductsPieData()} />
        </div>

        <div style={{ padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <h3 style={{ textAlign: 'center' }}>Phân Bổ Sản Phẩm</h3>
          <Doughnut options={doughnutOptions} data={getAllProductsDetailedData()} />
        </div>

        <div style={{ padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <h3 style={{ textAlign: 'center' }}>Xu hướng Kho và Đã Bán</h3>
          <Line options={lineOptions} data={getLineChartData()} />
        </div>

        <div style={{ padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
          <h3 style={{ textAlign: 'center' }}>Phân tích Phân Bổ Sản Phẩm</h3>
          <PolarArea 
            data={getAllProductsDetailedData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                }
              }
            }}
          />
        </div>
      </div>
      {products.map((product) => (
        <div key={product._id} className="product-chart" style={{
          marginBottom: '3rem',
          padding: '20px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          <h2 style={{ textAlign: 'center' }}>{product.name}</h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3>Chi tiết Tồn Kho</h3>
            <Bar options={barOptions} data={getProductInventoryBarData(product)} />
          </div>
          
          <h3>Tỉ lệ Kho và Đã Bán</h3>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Pie options={pieOptions} data={getProductInventoryPieData(product)} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;