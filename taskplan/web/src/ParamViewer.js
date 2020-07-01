import React from 'react';
import ParamFilter from "./ParamFilter";
import ParamSelection from "./ParamSelection";
import Param from "./Param";


class Column extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.colRef = React.createRef();
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.getClassName = this.getClassName.bind(this);
        this.dragEnterCounter = 0
    }

    getClassName() {
        return this.props.isDummy ? "table-col-dummy" : "table-col-entry";
    }

    onDragStart(e) {
        e.dataTransfer.setData("text/plain", this.props.col);
    }

    onDragOver(e) {
        e.preventDefault();
    }

    onDrop(e) {
        if (this.props.allowDrop) {
            e.preventDefault();
            this.props.addCol(e.dataTransfer.getData("text/plain"), this.props.col);

            this.dragEnterCounter = 0;
            this.colRef.current.className = this.getClassName();
        }
    }

    onDragEnter(e) {
        if (this.props.allowDrop) {
            e.preventDefault();
            this.colRef.current.className = this.getClassName() + " on-drag-over";
            this.dragEnterCounter++;
        }
    }

    onDragLeave(e) {
        if (this.props.allowDrop) {
            e.preventDefault();
            this.dragEnterCounter--;
            if (this.dragEnterCounter === 0)
                this.colRef.current.className = this.getClassName();
        }
    }

    render() {
        return (
            <div className={this.getClassName()} ref={this.colRef} onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDragEnter={this.onDragEnter} onDrop={this.onDrop} onDragStart={this.onDragStart} draggable={"true"}>
                {!this.props.isDummy &&
                <React.Fragment>
                    <div>{this.props.col}</div>
                    {this.props.removeCol && <i className="fas fa-times" onClick={() => this.props.removeCol(this.props.col)}></i>}
                </React.Fragment>
                }
            </div>
        );
    }

}

class ParamViewer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: props.open == true,
            filterSaveName: "",
            viewPath: ""
        };

        this.paramCollapseSelection = React.createRef();
        this.paramGroupSelection = React.createRef();
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.saveFilter = this.saveFilter.bind(this);
        this.deleteFilter = this.deleteFilter.bind(this);
        this.handleFilterSaveNameChange = this.handleFilterSaveNameChange.bind(this);
        this.handleViewPathChange = this.handleViewPathChange.bind(this);
        this.addView = this.addView.bind(this);
        this.gotoTB = this.gotoTB.bind(this);
    }

    open() {
        this.setState({
            open: true
        });
    }

    close() {
        this.setState({
            open: false
        });
    }

    handleFilterSaveNameChange(event) {
        this.setState({
            filterSaveName: event.target.value
        });
    }


    saveFilter() {
        if (this.state.filterSaveName !== "") {
            this.props.saveFilter(this.state.filterSaveName);
        }
    }

    handleViewPathChange(event) {
        this.setState({
            viewPath: event.target.value
        });
    }


    addView() {
        if (this.state.viewPath !== "") {
            this.props.addView(this.state.viewPath);
        }
    }

    deleteFilter(name) {
        var data = new FormData();
        var dataJson = {};
        dataJson['name'] = name;

        data.append("data", JSON.stringify(dataJson));

        fetch("delete_filter", {
            method: "POST",
            body: data
        })
    }

    deleteView(path) {
        var data = new FormData();
        var dataJson = {};
        dataJson['path'] = path;

        data.append("data", JSON.stringify(dataJson));

        fetch("delete_view", {
            method: "POST",
            body: data
        })
    }


    gotoTB(path) {
        if (!(path in this.props.tensorboard_ports)) {
            var data = new FormData();
            var dataJson = {};
            dataJson['path'] = path;

            data.append("data", JSON.stringify(dataJson));

            fetch("/tensorboard", {
                method: "POST",
                body: data
            })
                .then(res => res.json())
                .then(
                    (result) => {
                        window.open("//" + window.location.hostname + ":" + result.port, '_blank');
                    },
                    (error) => {

                    }
                )
        } else {
            window.open("//" + window.location.hostname + ":" + this.props.tensorboard_ports[path], '_blank');
        }
    }

    render() {
        if (this.state.open) {
            return (
                <div className="param-viewer slide-editor editor" style={this.props.style}>
                    <div className="header">Save / Load{this.props.allowClose && <i className="fas fa-times" onClick={this.close}></i>}</div>
                    <div className="params-to-group param-filter">
                        {Object.keys(this.props.saved_filters).map(savedFilterName => (
                            <div className="param-name param-name-collapsed">
                                <div onClick={() => this.props.loadFilter(this.props.saved_filters[savedFilterName])}>
                                    {savedFilterName}
                                </div>
                                <i className="fas fa-times" onClick={() => this.deleteFilter(savedFilterName)}></i>
                            </div>
                        ))}
                    </div>
                    <input type="text" name="filterSaveName" value={this.state.filterSaveName} onChange={this.handleFilterSaveNameChange}/>
                    <div className="buttons">
                        <div onClick={this.saveFilter}>Save</div>
                    </div>

                    {!this.props.hideViews &&
                    <React.Fragment>
                        <div className="header">Filesystem</div>
                        <div className="params-to-group param-filter">
                            {Object.keys(this.props.views).map(path => (
                                <div className="param-name param-name-collapsed">
                                    <div onClick={() => this.props.loadFilter(this.props.views[path])}>
                                        {path}
                                    </div>
                                    <div style={{"flex": "2 1 auto"}}></div>
                                    <div id="tb-link" onClick={() => this.gotoTB(path)} title="Start and open tensorboard">TB</div>
                                    <i className="fas fa-times" onClick={() => this.deleteView(path)}></i>
                                </div>
                            ))}
                        </div>
                        <input type="text" name="viewPath" value={this.state.viewPath} onChange={this.handleViewPathChange}/>
                        <div className="buttons">
                            <div onClick={this.addView}>Add</div>
                        </div>
                    </React.Fragment>
                    }

                    <div className="header">Filter</div>
                    <ParamFilter tags={this.props.tags} codeVersions={this.props.codeVersions} selectMultiple={true} paramsByGroup={this.props.paramsByGroup} selectedParamValues={this.props.selectedParamValues} toggleSelection={this.props.toggleSelection}/>

                    <div className="header">Collapsing</div>
                    <div className="params-to-collapse param-filter">
                        {this.props.collapsedParams.map(param_uuid => this.props.params.find(p => p.uuid === param_uuid)).map(param => (
                            <div className="param-name param-name-collapsed">{param.name} <i className="fas fa-times" onClick={() => this.props.removeParamCollapse(param)}></i></div>
                        ))}
                    </div>
                    <div style={{"display": "flex", "align-items": "center"}}>
                        <label>Sorting:</label>
                        <select value={this.props.collapseSorting[0]} onChange={this.props.onChangeCollapseSorting}>
                            <option value="saved">Saved</option>
                            <option value="name">Name</option>
                            <option value="created">Created</option>
                            <option value="iterations">Iterations</option>
                            {this.props.metric_superset.map(col => (
                                <option value={col}>{col}</option>
                            ))}
                        </select>
                        <span style={{"margin-left": "5px", "cursor": "pointer"}} onClick={this.props.flipCollapseSortingDirection} className={this.props.collapseSorting[1] ? "fa fa-sort-amount-down" : "fa fa-sort-amount-up"}></span>
                    </div>

                    <ParamSelection header="Select param to collapse" ref={this.paramCollapseSelection} paramsByGroup={this.props.paramsByGroup} onSelect={this.props.addParamCollapse}/>
                    <div className="buttons">
                        <div onClick={() => this.paramCollapseSelection.current.openDialog()}>Add</div>
                    </div>

                    <div className="header">Grouping</div>

                    <div className="params-to-group param-filter">
                        {this.props.groupedParams.map(params => (
                            <div className="param-name param-name-collapsed">
                                {params.map(param_uuid => this.props.params.find(p => p.uuid === param_uuid)).map(param => param.name).join(" / ")}
                                <i className="fas fa-times" onClick={() => this.props.removeParamGroup(params)}></i>
                            </div>
                        ))}
                    </div>
                    <ParamSelection header="Select params to group" selectMultiple={true} ref={this.paramGroupSelection} paramsByGroup={this.props.paramsByGroup} onSelect={this.props.addParamGroup}/>
                    <div className="buttons">
                        <div onClick={() => this.paramGroupSelection.current.openDialog()}>Add</div>
                    </div>

                    <div className="header">Parameter sorting</div>
                    <div style={{"display": "flex", "align-items": "center", "margin-top": "10px"}}>
                        <label>Version:</label>
                        <select value={this.props.versionInName} onChange={this.props.onChangeVersionInName}>
                            <option value="none">None</option>
                            <option value="commit_id">Commit id</option>
                            <option value="label">Label</option>
                        </select>
                    </div>
                    <div className="params-to-collapse param-filter">
                        <ul className="params-tab">
                            {this.props.params.sort((a, b) => this.props.paramSorting[a.uuid] - this.props.paramSorting[b.uuid]).map((param) => (
                                <Param
                                    key={param.uuid}
                                    param={param}
                                    sortMode={true}
                                    reorderParam={this.props.reorderParam}
                                    forceInName={param.uuid in this.props.forceParamInName && this.props.forceParamInName[param.uuid]}
                                    onChangeForceParamInName={this.props.onChangeForceParamInName}
                                />
                            ))}
                        </ul>
                    </div>

                    {this.props.selectedCols !== undefined &&
                    <React.Fragment>
                        <div className="header">Columns</div>
                        <div className="table-cols">
                            <div className="table-col">
                                <div className="table-col-header">Used:</div>
                                {this.props.selectedCols.map(col => (
                                    <Column
                                        col={col}
                                        allowDrop={true}
                                        removeCol={this.props.removeCol}
                                        addCol={this.props.addCol}
                                    />
                                ))}
                                <Column
                                    col={null}
                                    allowDrop={true}
                                    removeCol={this.props.removeCol}
                                    addCol={this.props.addCol}
                                    isDummy={true}
                                />
                            </div>
                            <div className="table-col">
                                <div className="table-col-header">Not used:</div>
                                {this.props.allCols.filter(col => (this.props.selectedCols.findIndex(x => x === col) === -1)).map(col => (
                                    <Column
                                        col={col}
                                    />
                                ))}
                            </div>
                        </div>
                    </React.Fragment>
                    }
                </div>
            );
        } else {
            return "";
        }
    }
}

export default ParamViewer;