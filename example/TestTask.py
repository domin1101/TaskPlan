import pickle
from pathlib import Path

import tensorflow as tf
import time

import taskplan

class TestTask(taskplan.Task):

    def __init__(self, preset, preset_pipe, logger):
        super().__init__(preset, preset_pipe, logger)
        self.sum = 0

    def save(self, path):
        with open(str(path / Path("model.pk")), 'wb') as handle:
            pickle.dump(self.sum, handle)

    def step(self, tensorboard_writer, current_iteration):
        time.sleep(1)
        self.sum += self.preset.get_int('step')
        self.logger.log("Current sum: " + str(self.sum) + " (Iteration " + str(current_iteration) + ")")
        tensorboard_writer.add_summary(tf.Summary(value=[tf.Summary.Value(tag="sum", simple_value=self.sum)]), current_iteration)

    def load(self, path):
        with open(str(path / Path("model.pk")), 'rb') as handle:
            self.sum = pickle.load(handle)
