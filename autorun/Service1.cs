using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;

namespace autorun
{
    public partial class Service1 : ServiceBase
    {
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            ProcessStartInfo info = new ProcessStartInfo();
            info.FileName = AppDomain.CurrentDomain.BaseDirectory + "cmd.bat";
            info.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory;
            info.WindowStyle = ProcessWindowStyle.Minimized;
            Process.Start(info);
        }

        protected override void OnStop()
        {
        }
    }
}
