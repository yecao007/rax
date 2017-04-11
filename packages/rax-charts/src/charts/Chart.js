import {createElement, Component, PropTypes} from 'rax';
import {isWeex} from 'universal-env';
import GM from 'g2-mobile';
import Canvas from 'rax-canvas';

import Defs from '../components/Defs';
import Axis from '../components/Axis';
import Coord from '../components/Coord';
import Animate from '../components/Animate';
import Global from '../components/Global';
import Guide from '../components/guide';

import Line from './Line';
import Area from './Area';
import Interval from './Interval';
import Point from './Point';
import Polygon from './Polygon';
import Schema from './Schema';
import IntervalStack from './IntervalStack';
import AreaStack from './AreaStack';

import isArray from '../utils/isArray';
import isFunction from '../utils/isFunction';

let WeexGM = null;
const WEEX_ID = 'taobao-fed-rax-chart-weex-id';

if (isWeex) {
  WeexGM = require('./weexGM');
}

class Chart extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string,
    draw: PropTypes.func,
    margin: PropTypes.array,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.chart = null;
    /**
     * global defs animate must only one
     */
    this.globalChildren = null;
    this.defsChildren = null;
    this.axisChildren = [];
    this.animateChildren = null;
    this.coordChildren = [];
    this.guideChildren = [];
    this.lineChildren = [];
    this.areaChildren = [];
    this.intervalChildren = [];
    this.pointChildren = [];
    this.schemaChildren = [];
    this.polygonChildren = [];
    this.areaStackChildren = [];
    this.intervalStackChildren = [];
  }

  componentDidMount() {
    this.refs.raxCharts.getContext().then((context) => {
      context.render();
      this.draw(context);
    });
  }

  draw = (context) => {
    const {draw} = this.props;
    const GMObject = isWeex ? WeexGM : GM;

    if (!draw || !isFunction(draw)) {
      this.arrangeChildren();

      this.globalChildren && new Global({GMObject, ...this.globalChildren.props});
    }

    if (isWeex) {
      // weex pixelRatio must to 1
      GMObject.Global.pixelRatio = 1;
      this.renderWeexChart(context);
    } else {
      this.renderWebChart(context);
    }

    if (draw && isFunction(draw)) {
      draw(this.chart, GMObject, context);
    } else {
      this.renderChildren();
    }
  };

  renderWeexChart = (context) => {
    const {margin} = this.props;

    WeexGM.ready(context);

    this.chart = new WeexGM.Chart({
      id: WEEX_ID,
      margin: margin
    });
  };

  renderWebChart = () => {
    const {id, margin} = this.props;

    this.chart = new GM.Chart({
      id: id,
      margin: margin
    });
  };

  arrangeChildren = () => {
    const {children} = this.props;
    if (children && isArray(children)) {
      children.forEach((item) => {
        switch (item.type) {
          case Defs:
            this.defsChildren = item;
            break;
          case Axis:
            this.axisChildren.push(item);
            break;
          case Coord:
            this.coordChildren.push(item);
            break;
          case Animate:
            this.animateChildren = item;
            break;
          case Guide:
            this.guideChildren.push(item);
            break;
          case Global:
            this.globalChildren = item;
            break;
          case Line:
            this.lineChildren.push(item);
            break;
          case Area:
            this.areaChildren.push(item);
            break;
          case Interval:
            this.intervalChildren.push(item);
            break;
          case Point:
            this.pointChildren.push(item);
            break;
          case Schema:
            this.schemaChildren.push(item);
            break;
          case Polygon:
            this.polygonChildren.push(item);
            break;
          case IntervalStack:
            this.intervalStackChildren.push(item);
            break;
          case AreaStack:
            this.areaStackChildren.push(item);
        }
      });
    }
  };

  renderChildren = () => {
    let chart = this.chart;

    const newChildren = (children, ChildrenType) => {
      children && children.length > 0 && children.forEach((item) => {
        new ChildrenType({chart, ...item.props});
      });
    };

    newChildren(this.guideChildren, Guide);

    this.defsChildren && new Defs({chart, ...this.defsChildren.props});

    newChildren(this.axisChildren, Axis);
    newChildren(this.coordChildren, Coord);

    this.animateChildren && new Animate({chart, ...this.animateChildren.props});

    newChildren(this.pointChildren, Point);
    newChildren(this.lineChildren, Line);
    newChildren(this.intervalChildren, Interval);
    newChildren(this.areaChildren, Area);
    newChildren(this.schemaChildren, Schema);
    newChildren(this.polygonChildren, Polygon);
    newChildren(this.intervalStackChildren, IntervalStack);
    newChildren(this.areaStackChildren, AreaStack);

    chart.render();
  };

  render() {
    let {width, height, id, backgroundColor} = this.props;

    if (isWeex) {
      id = WEEX_ID;
    }

    let style = {
      height: height,
      width: width,
    };

    if (backgroundColor) {
      style.backgroundColor = backgroundColor;
    }

    // weex canvas must have backgroundColor
    if (isWeex && !backgroundColor) {
      style = {
        height: height,
        width: width,
        backgroundColor: '#ffffff'
      };
    }

    return (
      <Canvas style={style} ref="raxCharts" id={id} />
    );
  }
}

export default Chart;