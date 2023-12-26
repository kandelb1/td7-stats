'use client'
import { WeaponStats } from '@/app/lib/definitions';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './page.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IProps {
  weaponData: WeaponStats[];
}

export default function WeaponChart(props: IProps) {

  function getChartColors(): string[] {
    let answer: string[] = [];
    for(let weap of props.weaponData) {
      switch(weap.weaponName) {
        case 'rl':
          answer.push('rgba(255, 0, 0, 0.8)');
          break;
        case 'lg':
          answer.push('rgba(255, 255, 176, 0.8)');
          break;
        case 'rg':
          answer.push('rgba(20, 197, 19, 0.8)');
          break;
        case 'mg':
          answer.push('rgba(255, 255, 64, 0.8)');
          break;
        case 'sg':
          answer.push('rgba(255, 129, 0, 0.8)');
          break;
        case 'hmg':
          answer.push('rgba(206, 165, 0, 0.8)');
          break;
        case 'gl':
          answer.push('rgba(2, 120, 18, 0.8)');
          break;
        case 'pg':
          answer.push('rgba(197, 0, 255, 0.8)');
          break;
      }
    }
    return answer;
  }

  const data = {
    labels: props.weaponData.map(weap => weap.weaponName),
    datasets: [
      {
        label: "Damage",
        data: props.weaponData.map(weap => weap.damage),
        backgroundColor: getChartColors(),
      }
    ],
  };

  const options = {
    maintainAspectRatio: false,
  };

  return (
    <div className={styles.pieChart}>
      <Pie data={data} options={options} />
    </div>
  )
}