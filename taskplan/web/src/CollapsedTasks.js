import React from 'react';
import PausedTask from "./PausedTask";
import LazyLoad from 'react-lazyload';

class CollapsedTasks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            collapsed: true
        };

        this.toggleCollapsed = this.toggleCollapsed.bind(this);
    }

    toggleCollapsed() {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }

    render() {
        let tasks = Object.values(this.props.tasks);//.filter(task => task.task !== null);
        if (tasks.length > 0) {
            return (
                <div>
                    <LazyLoad key={tasks[0].uuid} height={102} offset={[0, 0]} scrollContainer=".project" resize={true} overflow={true}>
                        <PausedTask
                            uuid={tasks[0].uuid}
                            rerunTask={this.props.rerunTask}
                            task={tasks[0].task}
                            metrics={tasks[0].metrics}
                            name={tasks[0].name}
                            showTask={this.props.showTask}
                            highlight={tasks[0].uuid === this.props.highlightedTask}
                            filterLikeTask={this.props.filterLikeTask}
                            devices={this.props.devices}
                            detailCol={this.props.detailCol}
                        />
                     </LazyLoad>
                    {tasks.length > 1 &&
                        <div class="collapse-toggle" onClick={this.toggleCollapsed}>{
                            this.state.collapsed
                                ?
                                <div><i className="fas fa-angle-double-down"></i> {"Expand (" + tasks.length + ")"}</div>
                                :
                                <div><i className="fas fa-angle-double-up"></i> Collapse</div>
                        }</div>
                    }
                    {!this.state.collapsed && tasks.slice(1).map(task => (
                        <LazyLoad key={tasks.uuid} height={102} offset={[0, 0]} scrollContainer=".project" resize={true} overflow={true}>
                            <PausedTask
                                uuid={task.uuid}
                                rerunTask={this.props.rerunTask}
                                task={task.task}
                                name={task.name}
                                showTask={this.props.showTask}
                                highlight={task.uuid === this.props.highlightedTask}
                                filterLikeTask={this.props.filterLikeTask}
                                devices={this.props.devices}
                                detailCol={this.props.detailCol}
                                metrics={task.metrics}
                            />
                        </LazyLoad>
                    ))}
                </div>
            );
        } else {
            return "";
        }
    }
}

export default CollapsedTasks;