'use client'
import styles from './page.module.scss'
import { MapStats } from "@/app/lib/definitions";
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
  mapStats: MapStats[];
}

export default function TeamMapChart(props: IProps) {
  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Map Wins and Losses',
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
    ticks: {
      stepSize: 1,
    },
    maintainAspectRatio: false,
  };

  const data = {
    labels: props.mapStats.map(x => x.name),
    datasets: [
      {
        label: 'Wins',
        data: props.mapStats.map(x => x.wins),
        backgroundColor: 'rgb(0, 255, 0)',
      },
      {
        label: 'Losses',
        data: props.mapStats.map(x => x.losses),
        backgroundColor: 'rgb(255, 0, 0)',
      }
    ],
  };

  return (
    <div className={styles.chart}>
      <Bar data={data} options={options} />
    </div>    
  )
}