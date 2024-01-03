'use client'
import styles from './page.module.scss'
import { TeamInfo } from "@/app/lib/definitions";
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
  teamInfo: TeamInfo; 
}

export default function TeamServerChart(props: IProps) {
  const teamInfo = props.teamInfo;

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
    labels: teamInfo.serverStats.map(x => x.name),
    datasets: [
      {
        label: 'Wins',
        data: teamInfo.serverStats.map(x => x.wins),
        backgroundColor: 'rgb(0, 255, 0)',
      },
      {
        label: 'Losses',
        data: teamInfo.serverStats.map(x => x.losses),
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