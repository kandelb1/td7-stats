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

export default function TeamMapChart(props: IProps) {
  const teamInfo = props.teamInfo;
  console.log(teamInfo);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Map Wins and Losses',
      },
    },
    maintainAspectRatio: false,
  };

  const data = {
    labels: teamInfo.mapStats.map(x => x.name),
    datasets: [
      {
        label: 'Wins',
        data: teamInfo.mapStats.map(x => x.wins),
        backgroundColor: 'rgb(0, 255, 0)',
      },
      {
        label: 'Losses',
        data: teamInfo.mapStats.map(x => x.losses),
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