# Copyright (C) 2022, twiinIT
# SPDX-License-Identifier: BSD-3-Clause

import pyarrow as pa

table = pa.Table.from_pydict({'x': [1, 2, 3, 4, 5], 'y': [10, 20, 30, 40, 50]})

sink = pa.BufferOutputStream()

with pa.ipc.new_stream(sink, table.schema) as writer:
    writer.write_table(table)

buf = sink.getvalue()
data = buf.to_pybytes()
