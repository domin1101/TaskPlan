from taskplan.TaskWrapper import TaskWrapper
import shutil

class View:

    def __init__(self, presets, root):
        self.presets = []
        for preset in presets:
            self.presets.append({"preset": preset, "visible_choices": 0})

        self.state = {
            "type": "root",
            "children": {
                "default": {
                    "type": "tasks",
                    "children": {}
                }
            }
        }
        self.root = root

    def initialize(self, tasks):
        for task in tasks:
            self.add_task(task, False)
        self._check_filesystem(self.state["children"]["default"], self.root)

    def add_task(self, task, change_dirs=True):
        current_path = self.root
        parent_state = self.state
        current_state = self.state["children"]["default"]
        last_key = "default"
        for preset in self.presets:
            suitable_choice = self._get_choice_to_preset(task, preset)

            if suitable_choice is not None:
                name = suitable_choice.get_metadata("name")
                if current_state["type"] == "tasks" or current_state["preset"] != preset:
                    first_task = self._get_first_task_in(current_state)
                    if first_task is None:
                        continue

                    former_choice = self._get_choice_to_preset(first_task, preset)
                    if former_choice == suitable_choice:
                        continue

                    current_state = self._add_preset_after_state(parent_state, last_key, preset, former_choice)

                current_path = current_path / name
                if name not in current_state["children"]:
                    current_state["children"][name] = {
                        "type": "preset",
                        "preset": preset,
                        "children": {}
                    }

                    if change_dirs:
                        current_path.mkdir()

                last_key = name
                parent_state = current_state
                current_state = current_state["children"][name]
            else:
                raise NotImplementedError()

        if "type" not in current_state:
            current_state["type"] = "tasks"
            current_state["children"] = {}

        self._insert_task(current_state, current_path, task, change_dirs)

    def _add_preset_after_state(self, state, child_key, preset, former_choice):
        new_state = {
            "type": "preset",
            "preset": preset,
            "children": {
                former_choice.get_metadata("name"): state["children"][child_key]
            }
        }
        state["children"][child_key] = new_state
        return new_state

    def _get_choice_to_preset(self, task, preset):
        suitable_choice = None
        for choice in task.preset.base_presets:
            if choice.get_metadata("preset") == str(preset["preset"].uuid):
                suitable_choice = choice
                break
        return suitable_choice

    def _get_first_task_in(self, state):
        if type(state) == TaskWrapper:
            return state

        children = state["children"]
        if len(children.keys()) > 0:
            return self._get_first_task_in(children[list(children.keys())[0]])
        else:
            return None

    def _comp_tasks(self, first_task, second_task):
        return first_task.creation_time < second_task.creation_time

    def _insert_task(self, state, path, task, change_dirs=True):
        children = state["children"]

        target_key = len(children.keys())
        for i in range(len(children.keys())):
            if not self._comp_tasks(children[str(i)], task):
                target_key = i
                break

        for i in reversed(range(target_key, len(children.keys()))):
            children[str(i + 1)] = children[str(i)]

            if change_dirs:
                (path / str(i)).rename((path / str(i + 1)))

        children[str(target_key)] = task

        if change_dirs:
            (path / str(target_key)).symlink_to(task.build_save_dir(), True)

    def _check_filesystem(self, state, path):
        if type(state) == dict:
            if path.exists() and not path.is_dir():
                self._remove_path(path)

            path.mkdir(exist_ok=True)

            for child in path.iterdir():
                if not path.is_dir() or path.name not in state["children"].keys():
                    self._remove_path(child)

            for dir in state["children"].keys():
                self._check_filesystem(state["children"][dir], path / dir)
        elif type(state) == TaskWrapper:
            if path.exists() and (not path.is_symlink() or path.resolve(True) != state.build_save_dir()):
                self._remove_path(path)

            if not path.is_symlink():
                path.symlink_to(state.build_save_dir(), True)

    def _remove_path(self, path):
        if path.exists():
            if path.is_file() or path.is_symlink():
                path.unlink()
            else:
                shutil.rmtree(str(path))