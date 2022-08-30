# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import numpy as np
from cosapp.base import System
from cosapp.drivers import NonLinearSolver, RungeKutta, RunSingleCase
from cosapp.recorders import DataFrameRecorder
from pyportrait import Trait

from tlab.builtins import ArrayModel
from tlab.models import Model

# Inspired from
# https://cosapp.readthedocs.io/en/latest/tutorials/TimeDriverAdvanced.html


class PointMass(System):
    """Free fall of a point mass, with friction"""

    def setup(self):
        self.add_inward('mass', 1.2, desc='Mass')
        self.add_inward('k', 0.1, desc='Friction coefficient')
        self.add_inward('g',
                        np.r_[0, 0, -9.81],
                        desc='Uniform acceleration field')

        self.add_outward('a', np.zeros(3))

        self.add_transient('v', der='a')
        self.add_transient('x', der='v')

    def compute(self):
        self.a = self.g - (self.k / self.mass) * self.v


class Ballistics(PointMass):
    """System containing an initial condition, to be used as unknown"""

    def setup(self):
        super().setup()
        # Add inward `x0`, to be used as an unknown in a solver
        self.add_inward('x0', np.zeros(3), desc='Initial condition for x')
        # Add inward `v0`, to be used as an unknown in a solver
        self.add_inward('v0', np.zeros(3), desc='Initial condition for v')


class BallisticsTLab(Model):
    _modelName = 'Ballistics'

    # Inputs
    x0: ArrayModel = Trait(default_factory=ArrayModel).tag(observable=True)
    # Outputs
    v0: ArrayModel = Trait(default_factory=ArrayModel).tag(observable=True)
    time: ArrayModel = Trait(default_factory=ArrayModel).tag(observable=True)
    x: ArrayModel = Trait(default_factory=ArrayModel).tag(observable=True)
    z: ArrayModel = Trait(default_factory=ArrayModel).tag(observable=True)

    def __init__(self):
        super().__init__()
        self.x0.value = [0, 0, 0]

        # head system
        self.point = Ballistics('point')

        # Add drivers
        self.solver = self.point.add_driver(
            NonLinearSolver('solver', factor=0.9))
        self.target = self.solver.add_child(RunSingleCase('target'))
        self.driver = self.target.add_child(RungeKutta("RungeKutta", order=3))

        # Define a simulation scenario
        self.driver.time_interval = (0, 2)
        self.driver.dt = 0.1

        self.driver.set_scenario(init=dict(x='x0', v='v0'),
                                 values=dict(mass=1.5, k=0.92))

        # Add a recorder to capture time evolution in a dataframe
        self.driver.add_recorder(DataFrameRecorder(includes=['x', 'v', 'a']),
                                 period=0.1)

        # Define `v0` as unknown, so that the final value of `x` is a desired target point
        # Note:
        #   For `RunSingleCase` driver `target`, 'x' represents the position at the end of
        #   each time simulation, since it is the parent of the `RungeKutta` time driver.
        self.target.design.add_unknown('v0').add_equation('x == [10, 0, 10]')

    def run(self):
        self.driver.recorder.clear()

        self.target.set_init(dict(
            x0=np.array(self.x0.value),
            v0=np.ones(3),
        ))
        self.point.run_drivers()

        data = self.driver.recorder.export_data()

        self.v0.value = list(data['v'][0])
        self.time.value = list(data['time'])
        traj = np.asarray(list(data['x']))
        self.x.value = list(traj[:, 0])
        self.z.value = list(traj[:, 2])

    def on_message(self, msg):
        if msg == 'run_drivers':
            self.run()
