import Component from './Component';

interface ComponentInstance extends Component {
  isEnabled: boolean;
  order: number;
}

export default ComponentInstance;
