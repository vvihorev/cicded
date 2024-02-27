import enum
import os
import subprocess


class CommandStatus(enum.Enum):
    CREATED = 0
    PENDING = 1
    RUNNING = 2
    FAILED = 3
    COMPLETED = 4


class Command:
    def __init__(self, project_path, cmd):
        self.project_path = project_path
        self.cmd = cmd
        self.output = ""
        self.status = CommandStatus.CREATED

    def run(self):
        self.status = CommandStatus.RUNNING

        command = subprocess.Popen([f"cd {self.project_path} && {self.cmd}"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True, text=True)
        output, error = command.communicate()
        full_output = ""
        if output:
            full_output += output
        if error:
            full_output += error
         
        if command.returncode != 0:
            self.output = full_output
            self.status = CommandStatus.FAILED
        else:
            self.output = full_output
            self.status = CommandStatus.COMPLETED
        return self.status


class CommandChain:
    def __init__(self, name, project_path, commands):
        self.name = name
        self.project_path = project_path
        self.commands = [Command(project_path, cmd) for cmd in commands]

    def run(self):
        for cmd in self.commands:
            cmd.status = CommandStatus.PENDING
        failed = False

        for cmd in self.commands:
            if failed:
                cmd.status = CommandStatus.PENDING
                continue

            status = cmd.run()
            print(f"DEBUG: command '{cmd.cmd}' - {status.name}")
            if status == CommandStatus.FAILED:
                print(f"DEBUG: command chain '{self.name}' - {status.name}")
                failed = True

        print(f"DEBUG: command chain '{self.name}' - COMPLETED")
        return not failed

    def get_output(self):
        output = []
        for cmd in self.commands:
            output.append({"cmd": cmd.cmd, "status": cmd.status.value, "output": cmd.output})
        return output

