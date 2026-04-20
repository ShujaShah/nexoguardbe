import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  apiKey: string;
  timestamp: Date;
  request: {
    ip: string;
    method: string;
    path: string;
    browser: string;
    os: string;
    country: string;
  };
  threat_intel: {
    was_blocked: boolean;
    tags: string[];
  };
  payload: {
    headers: any;
    body: any;
  };
  response: {
    statusCode: number;
    latency_ms: number;
  };
}

// Mongoose Schema for Logs
const logSchema = new Schema<ILog>(
  {
    apiKey: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    request: {
      ip: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
      path: {
        type: String,
        required: true,
      },
      browser: {
        type: String,
        default: 'Unknown',
      },
      os: {
        type: String,
        default: 'Unknown',
      },
      country: {
        type: String,
        default: 'Unknown',
      },
    },
    threat_intel: {
      was_blocked: {
        type: Boolean,
        default: false,
      },
      tags: [
        {
          type: String,
        },
      ],
    },
    payload: {
      headers: {
        type: Schema.Types.Mixed,
      },
      body: {
        type: Schema.Types.Mixed,
      },
    },
    response: {
      statusCode: {
        type: Number,
        required: true,
      },
      latency_ms: {
        type: Number,
        required: true,
      },
    },
  },
  // MongoDB TimeSeries configuration
  {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'apiKey',
      granularity: 'seconds',
    },
    timestamps: false,
  },
);

export const LogModel = mongoose.model<ILog>('Log', logSchema);
