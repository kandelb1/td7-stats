'use client'
import { TeamStatistics } from "@/app/lib/definitions";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import styles from './page.module.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IProps {
  teamStats: TeamStatistics;
}

export default function TeamWeaponChart(props: IProps) {
  function getChartColors(): string[] {
    let answer: string[] = [];
    for(let weap of props.teamStats.weaponStats) {
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
        case 'gt':
          answer.push('rgba(0, 0, 255, 0.8)');
          break;
      }
    }
    return answer;
  }

  const data = {
    labels: props.teamStats.weaponStats.map(weap => weap.weaponName),
    datasets: [
      {
        label: "Damage",
        data: props.teamStats.weaponStats.map(weap => weap.totalDamage),
        backgroundColor: getChartColors(),
      },
    ]
  };

  // TODO: I want to hide every slice in the pie chart except rl, lg, and rg to start
  // those are always the biggest slices and the other ones are so small you can barely see them
  // so it makes sense to hide them on start
  // the only problem is it takes WAY too much work to do this
  // I tried some stuff from this stackoverflow post and maybe the solution lies here:
  // https://stackoverflow.com/questions/70706873/show-hide-all-nested-data-in-chartjs-pie-chart-when-outer-is-shown-hidden
  const options = {
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Total Damage Dealt per Weapon',
      },
    },
  };

  return (
    <div className={styles.pieChart}>
      <Pie data={data} options={options} />
    </div>
  )
}