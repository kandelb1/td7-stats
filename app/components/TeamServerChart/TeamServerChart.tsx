'use client'
import styles from './page.module.scss'
import { ServerStats } from "@/app/lib/definitions";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps{
  serverStats: ServerStats[];
}

export default function TeamServerChart(props: IProps) {
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Server Wins and Losses',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      }
    },
    maintainAspectRatio: false,
  };

  const data = {
    labels: props.serverStats.map(x => x.name),
    datasets: [
      {
        label: 'Wins',
        data: props.serverStats.map(x => x.wins),
        backgroundColor: 'rgb(0, 255, 0)',
      },
      {
        label: 'Losses',
        data: props.serverStats.map(x => x.losses),
        backgroundColor: 'rgb(255, 0, 0)',
      }
    ]
  };

  return (
    <div className={styles.chart}>
      <Bar data={data} options={options} />
    </div>    
  )
}