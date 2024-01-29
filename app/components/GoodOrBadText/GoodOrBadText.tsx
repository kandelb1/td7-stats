import { notEqual } from 'assert';
import styles from './page.module.scss';

interface IProps {
  value: number;
  threshold: number;
  notEqualTo?: boolean;
  goodColor?: string;
  badColor?: string
  children?: React.ReactNode;
}

export default function GoodOrBadText(props: IProps) {

  function getColor() {
    // there's gotta be a cleaner way to do this
    if(props.notEqualTo) {
      return props.value > props.threshold ? styles.a : styles.b;
    }
    return props.value >= props.threshold ? styles.a : styles.b;
  }

  return (
    <div className={getColor()}>
      {props.children}
    </div>
  );
}