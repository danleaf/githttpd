using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using System.Text;

namespace autorun
{
    public partial class Service1 : ServiceBase
    {
        Process pr;

        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            StreamReader sr = new StreamReader(AppDomain.CurrentDomain.BaseDirectory + "command");
            var cmd = sr.ReadLine().Trim();
            sr.Close();

            int space = -1;
            space = cmd.IndexOf(' ');
            if (space < 0)
                space = cmd.IndexOf('\t');

            //Debugger.Launch(); Debugger.Break();

            ProcessStartInfo info = new ProcessStartInfo();
            info.FileName = space < 0 ? cmd : cmd.Substring(0, space);
            if (space > 0)
                info.Arguments = cmd.Substring(space).Trim();
            info.WorkingDirectory = AppDomain.CurrentDomain.BaseDirectory;
            info.CreateNoWindow = true;
            pr = Process.Start(info);
        }

        protected override void OnStop()
        {
            try
            {
                pr.Kill();
            }
            catch (Exception e)
            {
                try
                {
                    StreamWriter sr = new StreamWriter(AppDomain.CurrentDomain.BaseDirectory + "autorun-error.log");
                    sr.WriteLine("stop command process failed");
                    sr.Write(e.Message);
                    sr.Close();
                }
                catch (Exception) { }
            }
        }
    }
}
