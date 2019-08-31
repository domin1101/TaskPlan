import React from 'react';
import Project from "./Project";
import Prompt from "./Prompt";
import CodeVersionViewer from "./CodeVersionViewer";
import TaskViewer from "./TaskViewer";

class ProjectManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            codeVersionTrees: {},
            currentProject: 0,
            highlightedTask: null
        };
        this.gotoTB = this.gotoTB.bind(this);
        this.addVersion = this.addVersion.bind(this);
        this.updateProjects = this.updateProjects.bind(this);
        this.addCodeVersions = this.addCodeVersions.bind(this);
        this.openTaskViewer = this.openTaskViewer.bind(this);
        this.openCodeVersionViewer = this.openCodeVersionViewer.bind(this);
        this.closeViewer = this.closeViewer.bind(this);
        this.promptRefs = React.createRef();
        this.codeVersionViewerRef = React.createRef();
        this.taskViewerRef = React.createRef();
    }

    componentDidMount() {
        this.props.repository.onChange("projects", this.updateProjects);
        this.props.repository.onAdd("codeVersions", this.addCodeVersions);
        this.updateProjects(this.props.repository.projects);
        for (let codeVersion in this.props.repository.codeVersions)
            this.addCodeVersions(this.props.repository.codeVersions[codeVersion]);
    }

    componentWillUnmount() {
        this.props.repository.removeOnChange("projects", this.updateProjects);
        this.props.repository.removeOnAdd("codeVersions", this.addCodeVersions);
    }

    updateProjects(projects) {
        this.setState({
            projects: Object.values(projects)
        });
    }

    addCodeVersions(codeVersion) {
        let newNode = {
            "uuid": codeVersion.uuid,
            "name": codeVersion.name,
            "base": codeVersion.base,
            "time": codeVersion.time,
            "children": []
        };
        let codeVersionTrees = Object.assign({}, this.state.codeVersionTrees);
        const projectName = codeVersion.project_name;
        if (!(projectName in codeVersionTrees)) {
            codeVersionTrees[projectName] = newNode;
            this.setState({
                codeVersionTrees: codeVersionTrees
            });
        } else {
            this.insertCodeVersionNode(codeVersionTrees[projectName], newNode);
            this.setState({
                codeVersionTrees: codeVersionTrees
            });
        }
    }

    insertCodeVersionNode(root, newNode) {
        if (root.uuid === newNode.base) {
            root.children.push(newNode);
            newNode.base = root;
        } else {
            for (let child of root.children) {
                this.insertCodeVersionNode(child, newNode);
            }
        }
    }

    updateCodeVersionNode(root, newNode) {
        if (root.uuid === newNode.uuid) {
            root.name = newNode.name;
            root.time = newNode.time;
        } else {
            for (let child of root.children) {
                this.updateCodeVersionNode(child, newNode);
            }
        }
    }

    gotoTB() {
        if (this.state.projects[this.state.currentProject].tensorboard_port === -1) {
             fetch("/tensorboard/" + this.state.projects[this.state.currentProject].name)
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result !== -1) {
                            window.open("//" + window.location.hostname + ":" + result, '_blank');
                        }
                    },
                    (error) => {

                    }
                )
        } else {
            window.open("//" + window.location.hostname + ":" + this.state.projects[this.state.currentProject].tensorboard_port,'_blank');
        }
    }

    changeProject(deltaIndex) {
        var currentProject = this.state.currentProject;
        currentProject += deltaIndex;
        currentProject = Math.min(this.state.projects.length - 1, Math.max(0, currentProject));
        this.setState({
            currentProject: currentProject
        });
    }

    addVersion() {
        this.promptRefs.current.openDialog();
    }

    closeViewer() {
        this.codeVersionViewerRef.current.close();
        this.taskViewerRef.current.close();
    }

    openTaskViewer(task) {
        this.closeViewer();
        this.taskViewerRef.current.open(task);
    }

    openCodeVersionViewer() {
        this.closeViewer();
        this.codeVersionViewerRef.current.open();
    }

    highlightTask(task) {
        let project_id = this.state.projects.findIndex(project => project.name === task.project_name);
        if (project_id !== -1) {
            this.setState({
                currentProject: project_id,
                highlightedTask: task.uuid
            });
            setTimeout(() => {
                this.setState({
                    highlightedTask: null
                });
            }, 1500);
        }
    }

    render() {
        return (
            <div id="project-manager">
                <div id="projects-toolbar">
                    {this.state.projects.length > 0 &&
                        <div id="project-selector">
                            <span onClick={() => this.changeProject(-1)} className={this.state.currentProject > 0 ? 'active' : ''}>
                                <i className="fas fa-caret-left"></i>
                            </span>
                            <span>
                                {this.state.projects[this.state.currentProject].name}
                            </span>
                            <span onClick={() => this.changeProject(1)} className={this.state.currentProject < this.state.projects.length - 1 ? 'active' : ''}>
                                <i className="fas fa-caret-right"></i>
                            </span>
                        </div>
                    }
                    {this.state.projects.length > 0 && this.state.projects[this.state.currentProject].current_code_version in this.props.repository.codeVersions &&
                        <span id="project-toolbar">
                            <div id="code-version" title="Add new code version" onClick={this.openCodeVersionViewer}>{this.props.repository.codeVersions[this.state.projects[this.state.currentProject].current_code_version].name}</div>
                            <div id="tb-link" onClick={this.gotoTB} title="Start and open tensorboard">TB</div>
                        </span>
                    }
                </div>
                <div id="projects">
                    {this.state.projects.map((project, index) => (
                        <Project
                            key={project.name}
                            project={project}
                            repository={this.props.repository}
                            visible={index === this.state.currentProject}
                            showTask={this.openTaskViewer}
                            closeViewer={this.closeViewer}
                            highlightedTask={index === this.state.currentProject ? this.state.highlightedTask : null}
                            devices={this.props.devices}
                        />
                    ))}
                </div>
                {this.state.projects.length > 0 && this.state.projects[this.state.currentProject].name in this.state.codeVersionTrees &&
                    <CodeVersionViewer
                        ref={this.codeVersionViewerRef}
                        codeVersionTree={this.state.codeVersionTrees[this.state.projects[this.state.currentProject].name]}
                        currentCodeVersion={this.state.projects[this.state.currentProject].current_code_version}
                        project_name={this.state.projects[this.state.currentProject].name}
                    />
                }
                <TaskViewer ref={this.taskViewerRef} repository={this.props.repository} presets={Object.values(this.props.repository.presets)} codeVersions={this.props.repository.codeVersions} />
            </div>
        );
    }
}


export default ProjectManager;